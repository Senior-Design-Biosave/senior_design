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
  password: "NutellaBiscuit5!",
  database: "senior_design",
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

// multi point click to display species.
app.get("/api/species", (req, res) => {
  const { lat, lng, month } = req.query;
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const monthStr = month.toUpperCase();
  const radiusKm = 50;

  const sql = `
    SELECT ld.id, ld.latitude, ld.longitude
    FROM latlong_data ld
    WHERE month = ?
    AND (
      6371 * acos(
        cos(radians(?)) * cos(radians(ld.latitude)) *
        cos(radians(ld.longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(ld.latitude))
      )
    ) < ?
  `;

  db.query(sql, [monthStr, latitude, longitude, latitude, radiusKm], (err, results) => {
    if (err || results.length === 0) {
      return res.json([]);
    }

    const latlongIds = results.map(r => r.id);
    if (latlongIds.length === 0) return res.json([]);

    const speciesSql = `
      SELECT species_name, SUM(abundance) as abundance
      FROM species_location
      WHERE latlong_id IN (?)
      GROUP BY species_name
    `;

    db.query(speciesSql, [latlongIds], (err2, speciesResults) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Failed to fetch species data" });
      }

      res.json(speciesResults);
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

//API endpoint to get alpha per country for boxplot
/*app.get("/api/alpha-boxplot", (req, res) => {
  const query = `
    SELECT c.name AS country_name, l.alpha
    FROM latlong_data l
    JOIN countries c ON l.country_id = c.id
    WHERE l.alpha IS NOT NULL
    ORDER BY c.name, l.alpha;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching alpha diversity data:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      // Filter out any null or invalid alpha values
      const validResults = results.filter(item => 
        item.alpha !== null && !isNaN(item.alpha)
      );
      res.json(validResults);
    }
  });
});*/
// API endpoint to get alpha for a specific country
app.get("/api/alpha-boxplot/:country", (req, res) => {
  const country = req.params.country;
  const query = `
    SELECT c.name AS country_name, l.alpha
    FROM latlong_data l
    JOIN countries c ON l.country_id = c.id
    WHERE l.alpha IS NOT NULL AND c.name = ?
    ORDER BY l.alpha;
  `;

  db.query(query, [country], (err, results) => {
    if (err) {
      console.error("Error fetching alpha diversity data:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      const validResults = results.filter(item => 
        item.alpha !== null && !isNaN(item.alpha)
      );
      res.json(validResults);
    }
  });
});
app.get("/api/countries", (req, res) => {
  const query = `
    SELECT DISTINCT c.name AS country_name
    FROM latlong_data l
    JOIN countries c ON l.country_id = c.id
    WHERE l.alpha IS NOT NULL
    ORDER BY c.name;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching countries:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.json(results.map(item => item.country_name));
    }
  });
});

// GET country names
app.get("/api/country-settings", (req, res) => {
  db.query("SELECT name FROM countries ORDER BY name ASC", (err, results) => {
    if (err) {
      console.error("Error fetching countries:", err);
      return res.status(500).json({ error: "Failed to fetch countries" });
    }
    res.json(results);
  });
});

// Add user endpoint
app.post("/api/users", async (req, res) => {
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
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is standard

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
app.get("/api/users", (req, res) => {
  db.query("SELECT id, email, role FROM users", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Delete user endpoint
app.delete("/api/users/:id", (req, res) => {
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

//Change user password
app.put("/api/users/:id/reset-password", (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required" });
  }
  bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
      console.error("Hashing error:", err);
      return res.status(500).json({ error: "Error hashing password" });
    }
    db.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hash, userId],
      (err, results) => {
        if (err) {
          console.error("Error updating password:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "Password reset successfully" });
      }
    );
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});