    //WHITE MAP TO SEE THE DOTS
    // L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
    //   attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> contributors',
    // }).addTo(map);

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../leaflet-heat.js";
    
    const Heatmap = () => {
      const [heatmapData, setHeatmapData] = useState([]);
      const [selectedMonth, setSelectedMonth] = useState("ALL");
      const [isLoading, setIsLoading] = useState(false);
    
      const months = [
        "ALL", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
      ];
    
      useEffect(() => {
        fetchHeatmapData(selectedMonth);
      }, [selectedMonth]);
    
      const fetchHeatmapData = async(month) => {
        setIsLoading(true);
        const endpoint = month === "ALL" 
          ? "/api/heatmap"
          : `/api/heatmap/${month}`;
        
        fetch(`http://localhost:5000${endpoint}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.length === 0) {
              setHeatmapData([]);
              setIsLoading(false);
              return;
            }
    
            const alphas = data.map(item => item.alpha);
            const minAlpha = Math.min(...alphas);
            const maxAlpha = Math.max(...alphas);
            
            const formattedData = data.map(({ latitude, longitude, alpha }) => [
              latitude,
              longitude,
              (alpha - minAlpha) / (maxAlpha - minAlpha)
            ]);
            
            setHeatmapData(formattedData);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching heatmap data:", error);
            setIsLoading(false);
          });
      };
    
      useEffect(() => {
        if (heatmapData.length === 0) return;
    
        const map = L.map("heatmap", {
          center: [18.22525025, 42.4240741],
          zoom: 5,
          zoomControl: false,
        });
    
        L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
          attribution: "Google Satellite",
        }).addTo(map);

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
          radius: 15,
          blur: 5,
          max: 1.0,
          minOpacity: 0.3,
          gradient: {
            0.1: 'blue',
            0.3: 'cyan',
            0.5: 'lime',
            0.7: 'yellow',
            1.0: 'red'
          }
        }).addTo(map);
    
        return () => map.remove();
      }, [heatmapData]);
    
      return (
        <div style={{ position: "relative", height: "100vh", marginBottom: "20px"}}>
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
              height: "100%",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          ></div>
        </div>
      );
    };
    
    export default Heatmap;