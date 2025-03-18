import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
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

        // Group data by country_id and map country_id to country_name
        response.data.forEach((item) => {
          const { country_id, country_name, species_name, alpha } = item;

          if (!groupedData[country_id]) {
            groupedData[country_id] = [];
          }
          groupedData[country_id].push({ species: species_name, alpha: Number(alpha) });

          // Map country_id to country_name
          countryMap[country_id] = country_name;
        });

        setData(groupedData);
        setCountryNames(countryMap);
        setSelectedCountry(Object.keys(groupedData)[0] || null); // Default to the first country
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="card">
      <h3>Alpha Diversity</h3>

      {/* Country Selector */}
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

      {/* Bar Chart */}
      {selectedCountry && data[selectedCountry] ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
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
            <Bar dataKey="alpha" fill="#2ecc71" /> {/* Greenish color */}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default RelativeAbundance;