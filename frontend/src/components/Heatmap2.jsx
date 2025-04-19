import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../leaflet-heat.js";
    
    const Heatmap = () => {
      const [heatmapData, setHeatmapData] = useState([]);
      const [selectedMonth, setSelectedMonth] = useState("ALL");
      const [valueType, setValueType] = useState("alpha");
      const [isLoading, setIsLoading] = useState(false);
    
      const months = [
        "ALL", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
      ];
    
      useEffect(() => {
        fetchHeatmapData(selectedMonth);
      }, [selectedMonth, valueType]);
    
      const fetchHeatmapData = async(month) => {
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
            const validValues = values.filter(v => v!== null && !isNaN(v))
            if (validValues.length === 0) {
              alert(`No valid ${valueType.toUpperCase()} data found.`);
              setHeatmapData([]);
              setIsLoading(false);
              return;
            }
      
            const min = Math.min(...validValues);
            const max = Math.max(...validValues);
      
            //-------------------
            const formattedData = data
            .filter(item => item[valueType] !== null)  // Only include rows with non-null beta/alpha
            .map(item => {
              const val = item[valueType];
              let norm = 0;
              if (max !== min) {
                norm = (val - min) / (max - min);
              }
              return [item.latitude, item.longitude, norm];
            });          
            //--------------------
      
            setHeatmapData(formattedData);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching heatmap data:", error);
            setIsLoading(false);
          });
      };
    
      const addLegend = (map) => {
        const legend = L.control({ position: 'bottomright' });
      
        legend.onAdd = function () {
          const div = L.DomUtil.create('div', 'info legend');
          const colors = ['blue', 'cyan', 'lime', 'yellow', 'red'];
          
          div.innerHTML = `
            <div style="
              padding: 8px;
              background: white;
              border-radius: 5px;
              box-shadow: 0 1px 5px rgba(0,0,0,0.2);
            ">
              <h4 style="margin:0 0 8px 0; font-size:14px;">
                Species Density
              </h4>
              
              <!-- Full color gradient -->
              <div style="
                height: 12px;
                width: 100%;
                background: linear-gradient(to right, ${colors.join(',')});
                margin-bottom: 5px;
                border-radius: 2px;
              "></div>
              
              <!-- Simple endpoints -->
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
        
        // Google Satellite
        const satellite = L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
          attribution: "Google Satellite",
        });
        
        // Google Terrain
        const terrain = L.tileLayer("https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}", {
          attribution: "Google Terrain",
        });
        
        // Add one as default
        satellite.addTo(map);
        
        // Base map selector
        const baseMaps = {
          "Terrain": terrain,
          "Satellite": satellite,
        };
        
        // Add layer control (top-right corner)
        L.control.layers(baseMaps, null, { position: "topright", collapsed: false }).addTo(map);  
        
        

        map.on('click', async function (e) {
          const clickedLat = e.latlng.lat.toFixed(6);
          const clickedLng = e.latlng.lng.toFixed(6);
        
          try {
            const response = await fetch(`http://localhost:5000/api/species?lat=${clickedLat}&lng=${clickedLng}&month=${selectedMonth}`);
            const speciesData = await response.json();
        
            if (speciesData.length > 0) {
              const popupContent = speciesData
              .map(s => `
                <a href="https://www.google.com/search?q=${encodeURIComponent(`${s.species_name} genus`)}" 
                  target="_blank" 
                  style="color:#0077cc; text-decoration:none;">
                  <strong>${s.species_name}</strong>
                </a>: ${s.abundance}
              `)
              .join("<br>");
        
              L.popup()
                .setLatLng([clickedLat, clickedLng])
                .setContent(`<div style="font-size: 14px;">${popupContent}</div>`)
                .openOn(map);
            } else {
              L.popup()
                .setLatLng([clickedLat, clickedLng])
                .setContent(`<div style="font-size: 14px; color: gray;">No species data found here.</div>`)
                .openOn(map);
            }
          } catch (err) {
            console.error(err);
            L.popup()
              .setLatLng([clickedLat, clickedLng])
              .setContent(`<div style="color: red;">Error fetching data</div>`)
              .openOn(map);
          }
        });          
    
        L.heatLayer(heatmapData, {
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
        }).addTo(map); addLegend(map);
    
        return () => map.remove();
      }, [heatmapData]);
    
      return (
        <div style={{ position: "relative", height: "100vh", marginBottom: "20px"}}>
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