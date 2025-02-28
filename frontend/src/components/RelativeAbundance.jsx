import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { species: "Grey Hornbill", abundance: 99 },
  { species: "Arabian Wolf", abundance: 125 },
  { species: "Cape Hare", abundance: 227 },
  { species: "Desert Hedgehog", abundance: 201 },
  { species: "Common Kestrel", abundance: 227 },
  { species: "Arabian Red Fox", abundance: 368 },
  { species: "European Turtle Dove", abundance: 99 },
  { species: "Domestic Dog", abundance: 125 },
  { species: "True Toad", abundance: 227 },
  { species: "Redstart", abundance: 201 },
  { species: "Hoopoe", abundance: 227 },
  { species: "Domestic Sheep", abundance: 299 },
  { species: "BlackStart", abundance: 201 },
  { species: "Arabian Partridge", abundance: 125 },
];

function RelativeAbundance() {
  return (
    <div className="card">
      <h3>Relative Abundance</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="species" angle={-45} textAnchor="end" interval={0} height={70} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="abundance" fill="#3498db" /> {/* Blue color */}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RelativeAbundance;