import ee
import numpy as np
from PIL import Image
import io
import torch
from datetime import datetime
import joblib
from urllib.request import urlopen

ee.Initialize()


def safe_get(reduced, key, default=0.0):
    info = reduced.getInfo()
    return info.get(key, default)


def get_image_and_indices(lat, lon):
    # Set up point and buffer
    point = ee.Geometry.Point(lon, lat)
    region = point.buffer(50).bounds()  # 100m x 100m

    # Get current month
    now = datetime.utcnow()
    start = ee.Date.fromYMD(now.year, now.month, 1)
    end = start.advance(1, 'month')

    # Load Sentinel-2
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(region)
        .filterDate(start, end)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    )

    if collection.size().getInfo() == 0:
        raise ValueError("No Sentinel-2 images available for this location and month.")

    median = collection.median()

    # Select RGB + NIR
    image = median.select(['B4', 'B3', 'B2', 'B8'])

    # Compute indices
    ndvi = median.normalizedDifference(['B8', 'B4']).rename('NDVI')
    ndwi = median.normalizedDifference(['B3', 'B8']).rename('NDWI')
    evi = median.expression(
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))',
        {
            'NIR': median.select('B8'),
            'RED': median.select('B4'),
            'BLUE': median.select('B2')
        }
    ).rename('EVI')

    stacked = image.addBands(ndvi).addBands(ndwi).addBands(evi)

    # Get image thumbnail (RGB only)
    url = stacked.getThumbURL({
        'dimensions': '256x256',
        'region': region,
        'format': 'PNG',
        'min': 0,
        'max': 3000,
        'bands': ['B4', 'B3', 'B2']
    })

    image_bytes = urlopen(url).read()
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_array = np.array(image).astype(np.float32) / 255.0

    # Get average values
    reduced = stacked.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region,
        scale=10,
        maxPixels=1e13
    )

    # Safe extract or default to 0
    nir_value = safe_get(reduced, 'B8')
    ndvi_value = safe_get(reduced, 'NDVI')
    ndwi_value = safe_get(reduced, 'NDWI')
    evi_value = safe_get(reduced, 'EVI')

    # Month encoding
    month = now.month
    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    # Tabular vector: [R, G, B, NIR, NDVI, EVI, NDWI, month_sin, month_cos]
    tabular_vector = np.array([
        np.mean(img_array[:, :, 0]),  # R
        np.mean(img_array[:, :, 1]),  # G
        np.mean(img_array[:, :, 2]),  # B
        nir_value,
        ndvi_value,
        evi_value,
        ndwi_value,
        month_sin,
        month_cos
    ], dtype=np.float32)

    # Load the scaler
    scaler = joblib.load('scalers/tabular_scaler.pkl')
    scaled_vector = scaler.transform([tabular_vector])[0]  # shape: [1, 9]

    # Convert to torch tensors
    image_tensor = torch.from_numpy(img_array).permute(2, 0, 1).unsqueeze(0).float()  # [1, 3, 256, 256]
    tabular_tensor = torch.from_numpy(scaled_vector).unsqueeze(0).float()  # [1, 9]

    return image_tensor, tabular_tensor

