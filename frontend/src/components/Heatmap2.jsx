import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../leaflet-heat.js";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState({ actual: [], predicted: [] });
  const [selectedMonth, setSelectedMonth] = useState("ALL");
  const [valueType, setValueType] = useState("alpha");
  const [dataTypes, setDataTypes] = useState(["actual"]); // Now an array to support multiple selections
  const [isLoading, setIsLoading] = useState(false);
  const [radiusCircle, setRadiusCircle] = useState(null);

  const mapRef = useRef(null);
  const heatLayerRef = useRef({ actual: null, predicted: null });
  const legendRef = useRef(null);

  const months = [
    "ALL", "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  useEffect(() => {
    if (!dataTypes.includes("actual")) {
      setHeatmapData(prev => ({ ...prev, actual: [] }));
      return;
    }
    fetchHeatmapData(selectedMonth);
  }, [selectedMonth, valueType, dataTypes]);

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
          setHeatmapData(prev => ({ ...prev, actual: [] }));
          setIsLoading(false);
          return;
        }

        const values = data.map(item => item[valueType]);
        const validValues = values.filter(v => v !== null && !isNaN(v));
        if (validValues.length === 0) {
          alert(`No valid ${valueType.toUpperCase()} data found.`);
          setHeatmapData(prev => ({ ...prev, actual: [] }));
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

        setHeatmapData(prev => ({ ...prev, actual: formattedData }));
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching heatmap data:", error);
        setIsLoading(false);
      });
  };

  const addLegend = (map) => {
    if (legendRef.current) {
      try {
        map.removeControl(legendRef.current);
      } catch (e) {
        console.warn("Legend already removed.");
      }
      legendRef.current = null;
    }

    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend');
      
      // Create legend content for each active data type
      const legendContents = [];
      
      if (dataTypes.includes("actual")) {
        legendContents.push(`
          <div style="padding: 8px; background: white; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2); margin-bottom: 8px;">
            <h4 style="margin:0 0 8px 0; font-size:14px;">Actual ${valueType.toUpperCase()} Diversity</h4>
            <div style="height: 12px; width: 100%; background: linear-gradient(to right, blue, cyan, lime, yellow, red); margin-bottom: 5px; border-radius: 2px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>Low</span><span>High</span>
            </div>
          </div>
        `);
      }
      
      if (dataTypes.includes("predicted")) {
        legendContents.push(`
          <div style="padding: 8px; background: white; border-radius: 5px; box-shadow: 0 1px 5px rgba(0,0,0,0.2);">
            <h4 style="margin:0 0 8px 0; font-size:14px;">Predicted ${valueType.toUpperCase()} Diversity</h4>
            <div style="height: 12px; width: 100%; background: linear-gradient(to right, purple, #952ea0, #d44292, #f66d7a, yellow); margin-bottom: 5px; border-radius: 2px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 11px;">
              <span>Low</span><span>High</span>
            </div>
          </div>
        `);
      }

      div.innerHTML = legendContents.join('');
      return div;
    };

    legend.addTo(map);
    legendRef.current = legend;
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    addLegend(map);
  }, [dataTypes, valueType]);

  useEffect(() => {
    const map = L.map("heatmap", {
      center: [18.22525025, 42.4240741],
      zoom: 5,
      zoomControl: false,
    });

    // Add Search Control (GeoSearch)
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar',
      autoClose: true,
      //showMarker: true,
      showPopup: false,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
      searchLabel: 'Search for location...'
    });
    map.addControl(searchControl);

    const style = document.createElement('style'); //search bar CSS
    style.innerHTML = `
      .leaflet-control-geosearch {
        left: 50% !important;
        transform: translateX(-50%) !important;
        top: 10px !important;
        width: 400px !important;
        max-width: 80% !important;
      }
      .leaflet-control-geosearch form {
        width: 100% !important;
      }
      .leaflet-control-geosearch input {
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);

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

    L.control.layers(baseMaps, null, { position: "topleft", collapsed: false }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      map.removeControl(searchControl);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear all heat layers
    Object.values(heatLayerRef.current).forEach(layer => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    // Add heat layers for active data types
    if (dataTypes.includes("actual") && heatmapData.actual.length > 0) {
      const heatLayer = L.heatLayer(heatmapData.actual, {
        radius: 8,
        blur: 10,
        maxZoom: 12,
        minOpacity: 0.5,
        max: 1.0,
        gradient: {
          0.0: 'blue',
          0.25: 'cyan',
          0.5: 'lime',
          0.75: 'yellow',
          1.0: 'red'
        }
      }).addTo(map);
      heatLayerRef.current.actual = heatLayer;
    }

    if (dataTypes.includes("predicted") && heatmapData.predicted.length > 0) {
      const heatLayer = L.heatLayer(heatmapData.predicted, {
        radius: 8,
        blur: 10,
        maxZoom: 12,
        minOpacity: 0.5,
        max: 1.0,
        gradient: {
          0.0: 'purple',
          0.25: '#952ea0',
          0.5: '#d44292',
          0.75: '#f66d7a',
          1.0: 'yellow'
        }
      }).addTo(map);
      heatLayerRef.current.predicted = heatLayer;
    }
  }, [heatmapData, dataTypes, valueType]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = async (e) => {
      e.originalEvent?.preventDefault();
      e.originalEvent?.stopPropagation();
    
      const clickedLat = parseFloat(e.latlng.lat.toFixed(6));
      const clickedLng = parseFloat(e.latlng.lng.toFixed(6));
    
      // Clear previous radius circle if exists
      if (radiusCircle) {
        map.removeLayer(radiusCircle);
      }
    
      // Add new radius circle
      const newCircle = L.circle(e.latlng, {
        radius: 50000,
        color: 'blue',
        fillColor: '#add8e6',
        fillOpacity: 0.2,
      }).addTo(map);
      setRadiusCircle(newCircle);
    
      map.closePopup();
    
      // Handle predicted data click first if both are enabled
      if (dataTypes.includes("predicted")) {
        try {
          const predictResponse = await fetch("http://localhost:5050/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: clickedLat, lng: clickedLng })
          });
    
          if (!predictResponse.ok) {
            const errText = await predictResponse.text();
            throw new Error(`Server returned ${predictResponse.status}: ${errText}`);
          }
    
          const result = await predictResponse.json();
          const value = result[valueType];
    
          if (typeof value === "number") {
            const norm = Math.max(0, Math.min((value - 0.0) / (1.0 - 0.0), 1.0));
    
            setHeatmapData(prev => {
              const updated = {
                ...prev,
                predicted: [...prev.predicted, [clickedLat, clickedLng, norm]]
              };
            
              const map = mapRef.current;
            
              if (map && dataTypes.includes("predicted")) {
                // Remove old predicted heat layer if it exists
                if (heatLayerRef.current.predicted && map.hasLayer(heatLayerRef.current.predicted)) {
                  map.removeLayer(heatLayerRef.current.predicted);
                }
            
                // Create a new heat layer with the updated points
                const newLayer = L.heatLayer(updated.predicted, {
                  radius: 8,
                  blur: 10,
                  maxZoom: 12,
                  minOpacity: 0.5,
                  max: 1.0,
                  gradient: {
                    0.0: 'purple',
                    0.25: '#952ea0',
                    0.5: '#d44292',
                    0.75: '#f66d7a',
                    1.0: 'yellow'
                  }
                }).addTo(map);
            
                heatLayerRef.current.predicted = newLayer;
              }
            
              return updated;
            });
            
            const popupContent = 
              `<div style="font-size: 14px;">
                <strong style="color: #0077cc;">Predicted Diversity</strong><br>
                <b>Alpha</b>: ${result.alpha.toFixed(3)}<br>
                <b>Beta</b>: ${result.beta.toFixed(3)}
              </div>`;
    
            L.popup({ autoClose: false, closeOnClick: true })
              .setLatLng([clickedLat, clickedLng])
              .setContent(popupContent)
              .openOn(map);
    
            return; // Exit after showing predicted popup
          } else {
            throw new Error("Prediction returned invalid value");
          }
        } catch (error) {
          console.error("Error fetching prediction:", error);
          // If prediction fails, fall through to show actual data popup if enabled
        }
      }
    
      // Only show actual data popup if predicted is not enabled or failed
      if (dataTypes.includes("actual")) {
        let popupContent = `<div style="font-size: 14px;"><strong>Species Observed</strong><br>`;
        try {
          const response = await fetch(`http://localhost:5000/api/species?lat=${clickedLat}&lng=${clickedLng}&month=${selectedMonth}`);
          const speciesData = await response.json();
    
          if (speciesData.length > 0) {
            popupContent += speciesData.map(s => 
              `<a href="https://www.google.com/search?q=${encodeURIComponent(`${s.species_name} genus`)}"
                target="_blank"
                style="color:#0077cc; text-decoration:none;">
                ${s.species_name}
              </a>: ${s.abundance}`
            ).join("<br>");
          } else {
            popupContent += `<span style="color: gray;">No species data found here.</span>`;
          }
        } catch (err) {
          console.error(err);
          popupContent += `<span style="color: red;">Error fetching species data.</span>`;
        }
    
        L.popup({ autoClose: false, closeOnClick: true })
          .setLatLng([clickedLat, clickedLng])
          .setContent(popupContent + "</div>")
          .openOn(map);
      }
    };

    map.on("click", handleMapClick);
    return () => map.off("click", handleMapClick);
  }, [dataTypes, selectedMonth, valueType, radiusCircle]);

  const toggleDataType = (type) => {
    setDataTypes(prev => {
      if (prev.includes(type)) {
        if (prev.length > 1) {
          return prev.filter(t => t !== type);
        }
        return prev; // Don't allow empty selection
      }
      return [...prev, type];
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header section with all controls */}
      <div style={{
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        alignItems: 'center'
      }}>
        <div>
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

        <div>
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

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => toggleDataType("actual")}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: dataTypes.includes("actual") ? "#e6f7ff" : "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              cursor: "pointer"
            }}
          >
            Actual
          </button>
          <button
            onClick={() => toggleDataType("predicted")}
            style={{
              padding: "8px 12px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              backgroundColor: dataTypes.includes("predicted") ? "#f9f0ff" : "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              cursor: "pointer"
            }}
          >
            Predicted
          </button>
        </div>
      </div>

      {/* Map container */}
      <div style={{ flex: 1, position: 'relative' }}>
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
            paddingRight: "20px"
          }}
        ></div>
      </div>
    </div>
  );
};

export default Heatmap;