import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../leaflet-heat.js";

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    // Fetch data from API
    fetch("http://localhost:5000/api/heatmap")
      .then((response) => response.json())
      .then((data) => {
        // Transform data to required format: [lat, lon, intensity]
        const formattedData = data.map(({ latitude, longitude, alpha }) => [
          latitude,
          longitude,
          alpha,
        ]);
        setHeatmapData(formattedData);
      })
      .catch((error) => console.error("Error fetching heatmap data:", error));
  }, []);

  useEffect(() => {
    if (heatmapData.length === 0) return;

    const map = L.map("heatmap", {
      center: [18.22525025, 42.4240741],
      zoom: 12,
      zoomControl: false,
    });

    //WHITE MAP TO SEE THE DOTS
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> contributors',
    }).addTo(map);
    
    /*L.tileLayer("https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
      attribution: "Google Satellite",
    }).addTo(map);*/

    // Add heatmap layer
    L.heatLayer(heatmapData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    }).addTo(map);

    return () => map.remove();
  }, [heatmapData]);

  return (
    <div style={{ position: "relative", height: "100vh" }}>
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