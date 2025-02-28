import React from "react";

const leastPopulous = [
  { name: "Grey Hornbill", percentage: 10, image: "/images/greyhornbill.jpg", color: "#FFB6C1" }, // Light Pink
  { name: "Arabian Red Fox", percentage: 12, image: "images/arabian red fox.jpg", color: "#FF6347" }, // Tomato
  { name: "European Turtle Dove", percentage: 14, image: "images/european turtle-dove.jpg", color: "#FF4500" }, // Orange Red
];

const mostPopulous = [
  { name: "Domestic Sheep", percentage: 95, image: "images/domestic sheep.png", color: "#32CD32" }, // Lime Green
  { name: "Desert Hedgehog", percentage: 92, image: "images/desert hedgehog.jpg", color: "#00FA9A" }, // Medium Spring Green
  { name: "Common Kestrel", percentage: 89, image: "images/common kestrel.jpg", color: "#3CB371" }, // Medium Sea Green
];

const ProgressBar = ({ percentage, color }) => (
  <div className="progress-bar" style={{ backgroundColor: "#eee", borderRadius: "10px", overflow: "hidden", height: "10px", width: "100%" }}>
    <div style={{ width: `${percentage}%`, backgroundColor: color, height: "100%", borderRadius: "10px" }}></div>
  </div>
);

const PopulousAnimals = () => {
  return (
    <div className="populous-container">
      <div className="populous-card">
        <h3>Least Populous Animals</h3>
        {leastPopulous.map((animal, index) => (
          <div key={index} className="animal">
            <img src={animal.image} alt={animal.name} className="animal-img" />
            <div className="animal-info">
              <span>{animal.name}</span>
              <ProgressBar percentage={animal.percentage} color={animal.color} />
            </div>
            <span className="percentage">{animal.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="populous-card">
        <h3>Most Populous Animals</h3>
        {mostPopulous.map((animal, index) => (
          <div key={index} className="animal">
            <img src={animal.image} alt={animal.name} className="animal-img" />
            <div className="animal-info">
              <span>{animal.name}</span>
              <ProgressBar percentage={animal.percentage} color={animal.color} />
            </div>
            <span className="percentage">{animal.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopulousAnimals;