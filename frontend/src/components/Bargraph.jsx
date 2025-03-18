import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function RelativeAbundance() {
  const [data, setData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryNames, setCountryNames] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bargraph")
      .then((response) => {
        const groupedData = {};
        const countryMap = {};

        response.data.forEach((item) => {
          const { country_id, country_name, species_name, alpha } = item;

          if (!groupedData[country_id]) {
            groupedData[country_id] = [];
          }
          groupedData[country_id].push({ species: species_name, alpha: Number(alpha) });

          countryMap[country_id] = country_name;
        });

        setData(groupedData);
        setCountryNames(countryMap);
        setSelectedCountry(Object.keys(groupedData)[0] || null);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const chartWidth = data[selectedCountry] ? Math.max(600, data[selectedCountry].length * 50) : 600;

  return (
    <div className="card" style={{ width: "100%", overflowX: "auto" }}>
      <h3>Alpha Diversity</h3>

      <div style={{ marginBottom: "10px" }}>
        <label>Select Country: </label>
        <select
          value={selectedCountry || ""}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {Object.keys(data).map((countryId) => (
            <option key={countryId} value={countryId}>
              {countryNames[countryId] || `Country ${countryId}`}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && data[selectedCountry] ? (
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ width: chartWidth }}>
            <BarChart
              width={chartWidth}
              height={400}
              data={data[selectedCountry]}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="species"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={70}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="alpha" fill="#255F38" />
            </BarChart>
          </div>
        </div>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default RelativeAbundance;