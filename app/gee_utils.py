import ee
import numpy as np
from PIL import Image
import io
import torch
from datetime import datetime

ee.Initialize()

def get_image_and_indices(lat, lon):
    # Set up point and buffer
    point = ee.Geometry.Point(lon, lat)
    region = point.buffer(50).bounds()  # 100m x 100m

    # Get current month (same format as training)
    now = datetime.utcnow()
    start = ee.Date.fromYMD(now.year, now.month, 1)
    end = start.advance(1, 'month')

    # Load Sentinel-2 median composite
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filterDate(start, end)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
        .median()
    )

    # Select RGB + NIR bands
    image = collection.select(['B4', 'B3', 'B2', 'B8'])

    # Compute indices
    ndvi = collection.normalizedDifference(['B8', 'B4']).rename('NDVI')
    ndwi = collection.normalizedDifference(['B3', 'B8']).rename('NDWI')
    evi = collection.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        {
            'NIR': collection.select('B8'),
            'RED': collection.select('B4'),
            'BLUE': collection.select('B2')
        }
    ).rename('EVI')

    # Merge into one image
    stacked = image.addBands(ndvi).addBands(ndwi).addBands(evi)

    # Export as raw pixels (bands: B4, B3, B2, B8, NDVI, NDWI, EVI)
    url = stacked.getThumbURL({
        'dimensions': '256x256',
        'region': region,
        'format': 'PNG',
        'min': 0,
        'max': 3000,
        'bands': ['B4', 'B3', 'B2'],  # RGB (no NIR shown here, we add it separately)
    })

    # Load image from URL into numpy array
    from urllib.request import urlopen
    image_bytes = urlopen(url).read()
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_array = np.array(image).astype(np.float32) / 255.0  # normalize

    # Create dummy NIR (placeholder, or re-fetch separately if needed)
    nir_value = collection.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region,
        scale=10,
        maxPixels=1e9
    ).getNumber('B8').getInfo()

    # Indices
    ndvi_value = collection.normalizedDifference(['B8', 'B4']) \
        .reduceRegion(ee.Reducer.mean(), region, 10).get('NDVI').getInfo()
    ndwi_value = collection.normalizedDifference(['B3', 'B8']) \
        .reduceRegion(ee.Reducer.mean(), region, 10).get('NDWI').getInfo()
    evi_value = evi.reduceRegion(ee.Reducer.mean(), region, 10).get('EVI').getInfo()

    # Assemble tabular data (9D): [R, G, B, NIR, NDVI, EVI, NDWI, month_sin, month_cos]
    month = now.month
    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    tabular_vector = np.array([
        np.mean(img_array[:, :, 0]),  # R
        np.mean(img_array[:, :, 1]),  # G
        np.mean(img_array[:, :, 2]),  # B
        nir_value or 0,
        ndvi_value or 0,
        evi_value or 0,
        ndwi_value or 0,
        month_sin,
        month_cos
    ], dtype=np.float32)

    # Convert to torch tensors
    image_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0)  # [1, 3, 256, 256]
    tabular_tensor = torch.from_numpy(tabular_vector).unsqueeze(0)  # [1, 9]

    return image_tensor, tabular_tensor
