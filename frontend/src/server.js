const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors()); // Enable CORS to allow React to fetch data

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "SeniorDesign",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// API Route to get heatmap data
app.get("/api/heatmap", (req, res) => {
  const sql = "SELECT latitude, longitude, alpha, beta FROM latlong_data";
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// API endpoint to get species abundance per country for pie chart
app.get("/api/piechart", (req, res) => {
  const query = `
      SELECT c.name AS country, s.species_name, s.total_abundance 
      FROM species_abundance s
      JOIN countries c ON s.country_id = c.id
  `;

  db.query(query, (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send("Error fetching data");
      } else {
          res.json(results);
      }
  });
});

// API endpoint to get alpha per species per country for bar graph
app.get("/api/bargraph", (req, res) => {
  db.query(`
    SELECT c.id AS country_id, c.name AS country_name, s.species_name, s.alpha
    FROM species_abundance s
    JOIN countries c ON s.country_id = c.id
  `, (err, results) => {
    if (err) {
      console.error("Error fetching species abundance:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results);
    }
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});