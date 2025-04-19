import React, { useState, useEffect } from "react";
import axios from "axios";
import Boxplot, { computeBoxplotStats } from "react-boxplot";

function AlphaBoxPlot() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/alpha-boxplot")
      .then((response) => {
        const groupedData = {};

        response.data.forEach((item) => {
          const { country_name, alpha } = item;
          if (!groupedData[country_name]) {
            groupedData[country_name] = [];
          }
          groupedData[country_name].push(Number(alpha));
        });

        setData(groupedData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="card" style={{ width: "97%", overflowX: "auto" }}>
      <h3>Alpha Diversity Boxplots by Country</h3>
      {Object.entries(data).map(([country, values]) => (
        <div key={country} style={{ marginBottom: "20px" }}>
          <h4>{country}</h4>
          <Boxplot
            width={400}
            height={20}
            orientation="horizontal"
            min={Math.min(...values)}
            max={Math.max(...values)}
            stats={computeBoxplotStats(values)}
          />
        </div>
      ))}
    </div>
  );
}

export default AlphaBoxPlot;