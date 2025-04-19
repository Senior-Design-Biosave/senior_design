// ... (imports unchanged)
import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../leaflet-heat.js";

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [valueType, setValueType] = useState("alpha");
  const [dataType, setDataType] = useState("actual");
  const [isLoading, setIsLoading] = useState(false);
  const [radiusCircle, setRadiusCircle] = useState(null);

  const months = [
    "ALL", "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  useEffect(() => {
    fetchHeatmapData(selectedMonth);
  }, [selectedMonth, valueType, dataType]);

  const fetchHeatmapData = async (month) => {
    setIsLoading(true);
    const endpoint = month === "ALL"
      ? "/api/heatmap"
      : `/api/heatmap/${month}`;

    fetch(`http://localhost:5000${endpoint}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.length === 0) {
          alert(`No data available for ${valueType.toUpperCase()} in ${month}`);
          setHeatmapData([]);
          setIsLoading(false);
          return;
        }

        const values = data.map(item => item[valueType]);
        const validValues = values.filter(v => v !== null && !isNaN(v));
        if (validValues.length === 0) {
          alert(`No valid ${valueType.toUpperCase()} data found.`);
          setHeatmapData([]);
          setIsLoading(false);
          return;
        }

        const min = Math.min(...validValues);
        const max = Math.max(...validValues);

        const formattedData = data
          .filter(item => item[valueType] !== null)
          .map(item => {
            const val = item[valueType];
            let norm = 0;
            if (max !== min) {
              norm = (val - min) / (max - min);
            }
            return [item.latitude, item.longitude, norm];
          });

        setHeatmapData(formattedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching heatmap data:", error);
        setIsLoading(false);
      });
  };

  const addLegend = (map, isPredicted = false) => {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      const colors = isPredicted
        ? ['purple', '#952ea0', '#d44292', '#f66d7a', 'yellow']
        : ['blue', 'cyan', 'lime', 'yellow', 'red'];

      div.innerHTML = `
        <div style="
          padding: 8px;
          background: white;
          border-radius: 5px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.2);
        ">
          <h4 style="margin:0 0 8px 0; font-size:14px;">
            ${isPredicted ? 'Predicted' : 'Actual'} ${valueType.toUpperCase()} Diversity
          </h4>

          <div style="
            height: 12px;
            width: 100%;
            background: linear-gradient(to right, ${colors.join(',')});
            margin-bottom: 5px;
            border-radius: 2px;
          "></div>

          <div style="
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          ">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      `;

      return div;
    };

    legend.addTo(map);
  };

  useEffect(() => {
    if (heatmapData.length === 0) return;

    const map = L.map("heatmap", {
      center: [18.22525025, 42.4240741],
      zoom: 5,
      zoomControl: false,
    });

    const satellite = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      attribution: "Google Satellite",
    });

    const terrain = L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
      attribution: "Google Terrain",
    });

    satellite.addTo(map);

    const baseMaps = {
      "Terrain": terrain,
      "Satellite": satellite,
    };

    L.control.layers(baseMaps, null, { position: "topright", collapsed: false }).addTo(map);

    map.on('click', async function (e) {
      const clickedLat = e.latlng.lat.toFixed(6);
      const clickedLng = e.latlng.lng.toFixed(6);

      const latlng = e.latlng;

      if (radiusCircle) {
        map.removeLayer(radiusCircle);
      }

      const newCircle = L.circle(latlng, {
        radius: 50000,
        color: 'blue',
        fillColor: '#add8e6',
        fillOpacity: 0.2,
      }).addTo(map);

      setRadiusCircle(newCircle);

      let popupContent = `<div style="font-size: 14px;">`;

      try {
        const speciesResponse = await fetch(`http://localhost:5000/api/species?lat=${clickedLat}&lng=${clickedLng}&month=${selectedMonth}`);
        const speciesData = await speciesResponse.json();

        if (speciesData.length > 0) {
          popupContent += `<strong>Species Abundance:</strong><br>`;
          popupContent += speciesData.map(s => `
            <a href="https://www.google.com/search?q=${encodeURIComponent(`${s.species_name} genus`)}"
              target="_blank"
              style="color:#0077cc; text-decoration:none;">
              ${s.species_name}
            </a>: ${s.abundance}
          `).join("<br>");
        } else {
          popupContent += `<span style="color: gray;">No species data found here.</span>`;
        }
      } catch (err) {
        console.error(err);
        popupContent += `<span style="color: red;">Error fetching species data.</span>`;
      }

      // Only fetch and show prediction if "predicted" is selected
      if (dataType === "predicted") {
        try {
          const predictResponse = await fetch("http://localhost:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: clickedLat, lng: clickedLng })
          });

          const prediction = await predictResponse.json();

          if (prediction.error) {
            popupContent += `<br><br><span style="color: red;">Model Error: ${prediction.error}</span>`;
          } else {
            popupContent += `
              <br><br><strong>Model Prediction:</strong><br>
              Alpha: ${prediction.alpha.toFixed(3)}<br>
              Beta: ${prediction.beta.toFixed(3)}
            `;
          }
        } catch (err) {
          console.error(err);
          popupContent += `<br><br><span style="color: red;">Error fetching model prediction.</span>`;
        }
      }

      popupContent += `</div>`;

      L.popup()
        .setLatLng([clickedLat, clickedLng])
        .setContent(popupContent)
        .openOn(map);
    });

    const isPredicted = dataType === "predicted";

    L.heatLayer(heatmapData, {
      radius: 8,
      blur: 10,
      maxZoom: 12,
      minOpacity: 0.5,
      max: 1.0,
      gradient: isPredicted
        ? {
            0.0: 'purple',
            0.25: '#952ea0',
            0.5: '#d44292',
            0.75: '#f66d7a',
            1.0: 'yellow'
          }
        : {
            0.0: 'blue',
            0.25: 'cyan',
            0.5: 'lime',
            0.75: 'yellow',
            1.0: 'red'
          }
    }).addTo(map);

    addLegend(map, isPredicted);

    return () => map.remove();
  }, [heatmapData, dataType]);

  return (
    <div style={{ position: "relative", height: "100vh", marginBottom: "-3rem" }}>
      <div style={{ position: "absolute", top: "10px", left: "135px", zIndex: 1000 }}>
        <select
          value={valueType}
          onChange={(e) => setValueType(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <option value="alpha">Alpha Diversity</option>
          <option value="beta">Beta Diversity</option>
        </select>
      </div>

      <div style={{ position: "absolute", top: "10px", left: "10px", zIndex: 1000 }}>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {months.map(month => (
            <option key={month} value={month}>
              {month === "ALL" ? "All Months" : month}
            </option>
          ))}
        </select>
      </div>

      <div style={{ position: "absolute", top: "10px", left: "285px", zIndex: 1000 }}>
        <select
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <option value="actual">Actual Values</option>
          <option value="predicted">Predicted Values</option>
        </select>
      </div>

      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          backgroundColor: "rgba(255,255,255,0.8)",
          padding: "10px 20px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
        }}>
          Loading {selectedMonth === "ALL" ? "all data" : selectedMonth}...
        </div>
      )}

      <div
        id="heatmap"
        style={{
          height: "90%",
          borderRadius: "10px",
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      ></div>
    </div>
  );
};

export default Heatmap;