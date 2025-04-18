const express = require("express");
const bcrypt = require("bcrypt");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(express.json()); // Parse JSON bodies
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

//API for signin page
app.post("/api/signin", (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt for:", email); // Debug log

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      console.log("User not found:", email);
      return res.status(404).json({ error: "User not found" });
    }

    const user = results[0];
    console.log("Found user:", user.email); // Debug log
    
    try {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      console.log("Password match:", isMatch); // Debug log
      
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        },
      });
    } catch (bcryptErr) {
      console.error("Bcrypt error:", bcryptErr);
      res.status(500).json({ error: "Authentication error" });
    }
  });
});

// API Route to get filtered heatmap data by month
// For all months data
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

// For specific month data
app.get("/api/heatmap/:month", (req, res) => {
  const month = req.params.month.toUpperCase();
  const sql = "SELECT latitude, longitude, alpha, beta FROM latlong_data WHERE month = ?";
  db.query(sql, [month], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database query failed" });
    }
    res.json(results);
  });
});

// for clicking map point to display species
app.get("/api/species", (req, res) => {
  const { lat, lng, month } = req.query;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const monthStr = month.toUpperCase();

  const latMin = latitude - 0.0005;
  const latMax = latitude + 0.0005;
  const lonMin = longitude - 0.0005;
  const lonMax = longitude + 0.0005;

  const latlongSql = `
    SELECT id FROM latlong_data
    WHERE latitude BETWEEN ? AND ?
    AND longitude BETWEEN ? AND ?
    AND month = ?
    LIMIT 1
  `;

  db.query(latlongSql, [latMin, latMax, lonMin, lonMax, monthStr], (err, result) => {
    if (err || result.length === 0) {
      return res.json([]);
    }

    const latlongId = result[0].id;

    const speciesSql = `
      SELECT species_name, abundance
      FROM species_location
      WHERE latlong_id = ?
    `;

    db.query(speciesSql, [latlongId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to fetch species data" });
      }

      res.json(results);
    });
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

const verifyAdmin = (req, res, next) => {
  // In a real app, you'd get this from JWT or session
  if (req.headers['x-admin-auth'] !== 'true') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Add user endpoint
app.post("/api/users", verifyAdmin, async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    // Check if user exists
    const [existing] = await db.promise().query(
      "SELECT * FROM users WHERE email = ?", 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    await db.promise().query(
      "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
      [email, hashedPassword, role]
    );

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Get all users endpoint
app.get("/api/users", verifyAdmin, (req, res) => {
  db.query("SELECT id, email, role FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Delete user endpoint
app.delete("/api/users/:id", verifyAdmin, (req, res) => {
  const userId = req.params.id;
  
  db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});