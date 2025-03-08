import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Sample data for Alpha and Beta diversity
const alphaData = [
  { species: "Grey Hornbill", alpha: 99 },
  { species: "Arabian Wolf", alpha: 125 },
  { species: "Cape Hare", alpha: 227 },
  { species: "Desert Hedgehog", alpha: 201 },
  { species: "Common Kestrel", alpha: 227 },
  { species: "Arabian Red Fox", alpha: 368 },
  { species: "European Turtle Dove", alpha: 99 },
  { species: "Domestic Dog", alpha: 125 },
  { species: "True Toad", alpha: 227 },
  { species: "Redstart", alpha: 201 },
  { species: "Hoopoe", alpha: 227 },
  { species: "Domestic Sheep", alpha: 299 },
  { species: "BlackStart", alpha: 201 },
  { species: "Arabian Partridge", alpha: 125 },
];

const betaData = [
  { species: "Grey Hornbill", beta: 120 },
  { species: "Arabian Wolf", beta: 95 },
  { species: "Cape Hare", beta: 180 },
  { species: "Desert Hedgehog", beta: 160 },
  { species: "Common Kestrel", beta: 210 },
  { species: "Arabian Red Fox", beta: 400 },
  { species: "European Turtle Dove", beta: 120 },
  { species: "Domestic Dog", beta: 90 },
  { species: "True Toad", beta: 200 },
  { species: "Redstart", beta: 150 },
  { species: "Hoopoe", beta: 220 },
  { species: "Domestic Sheep", beta: 310 },
  { species: "BlackStart", beta: 180 },
  { species: "Arabian Partridge", beta: 130 },
];

function RelativeAbundance() {
  const [isAlpha, setIsAlpha] = useState(true);

  const toggleDiversity = () => {
    setIsAlpha((prev) => !prev);
  };

  return (
    <div className="card">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
      <h3>{isAlpha ? "Alpha Diversity" : "Beta Diversity"}</h3>
      <button onClick={toggleDiversity} style={{fontSize: "14px"}}>
        {isAlpha ? "Beta" : "Alpha"}
      </button>
    </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={isAlpha ? alphaData : betaData}
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
          <Bar dataKey={isAlpha ? "alpha" : "beta"} fill={isAlpha ? "#3498db" : "#e74c3c"} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RelativeAbundance;
