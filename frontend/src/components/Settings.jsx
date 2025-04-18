import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";

function Settings() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // User management state
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "ecologist"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all users
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) {
      setError("Email and password are required");
      return;
    }

    try {
        setLoading(true);
        setError("");
        await axios.post("http://localhost:5000/api/users", newUser, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        setNewUser({ email: "", password: "", role: "ecologist" });
        fetchUsers(); // Refresh the user list
      } catch (err) {
        setError(err.response?.data?.error || "Failed to add user");
        console.error("Error adding user:", err);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
    
        try {
          setLoading(true);
          await axios.delete(`http://localhost:5000/api/users/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          });
          fetchUsers(); // Refresh the user list
        } catch (err) {
          setError(err.response?.data?.error || "Failed to delete user");
          console.error("Error deleting user:", err);
        } finally {
          setLoading(false);
        }
      };

  // Static data for demonstration
  const satelliteOptions = ["Landsat 9", "Sentinel-2", "MODIS", "Custom"];
  const colorPalettes = [
    { name: "Default", value: "default" },
    { name: "High Contrast", value: "high-contrast" },
    { name: "Colorblind Friendly", value: "colorblind" }
  ];
  const countryOptions = ["Global", "United States", "Brazil", "India", "Australia"];

  return (
    <div className="settings-container">
        <style>{`
        .user-management-form {
          margin-bottom: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 5px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        .form-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .users-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .users-table th, .users-table td {
          padding: 10px;
          border: 1px solid #ddd;
          text-align: left;
        }
        .users-table th {
          background-color: #f2f2f2;
        }
        .action-button {
          padding: 5px 10px;
          margin-right: 5px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        .action-button.delete {
          background-color: #e74c3c;
          color: white;
        }
        .action-button.reset {
          background-color: #3498db;
          color: white;
        }
      `}</style>

      <h1 className="settings-title">Settings</h1>
      
      {/* Common Settings (for all users) */}
      <div className="settings-section">
        <h2 className="section-title">General Settings</h2>
        
        <div className="setting-item">
          <h3>Satellite Imagery Source</h3>
          <select className="settings-dropdown" disabled>
            {satelliteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <p className="setting-description">
            Choose which satellite imagery to use for analysis
          </p>
        </div>

        <div className="setting-item">
          <h3>Color Palette</h3>
          <div className="color-options">
            {colorPalettes.map((palette) => (
              <div key={palette.value} className="color-option">
                <input
                  type="radio"
                  id={palette.value}
                  name="color-palette"
                  value={palette.value}
                  disabled
                />
                <label htmlFor={palette.value}>{palette.name}</label>
              </div>
            ))}
          </div>
          <p className="setting-description">
            Set color scheme for predicted vs actual data visualization
          </p>
        </div>

        <div className="setting-item">
          <h3>Default Map View</h3>
          <select className="settings-dropdown" disabled>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <p className="setting-description">
            Set the default zoom location when opening the map
          </p>
        </div>
      </div>

      {/* Admin-Only Settings */}
      {isAdmin && (
        <div className="settings-section admin-section">
          <h2 className="section-title">Administrator Controls</h2>
          
          <div className="setting-item">
            <h3>Species Data Management</h3>
            <div className="admin-controls">
              <button className="admin-button" disabled>
                Add New Species
              </button>
              <button className="admin-button" disabled>
                Delete Species
              </button>
            </div>
            <p className="setting-description">
              Manage species database entries
            </p>
          </div>

          <div className="setting-item">
            <h3>Bulk Data Import</h3>
            <div className="file-upload">
              <input type="file" accept=".xlsx,.csv" disabled />
              <button className="admin-button" disabled>
                Upload Excel File
              </button>
            </div>
            <p className="setting-description">
              Import species data from spreadsheet (Excel/CSV)
            </p>
          </div>

          <div className="setting-item">
            <h3>Model Training</h3>
            <div className="file-upload">
              <input type="file" accept=".h5,.pth,.model" disabled />
              <button className="admin-button" disabled>
                Upload New Model
              </button>
            </div>
            <p className="setting-description">
              Upload updated machine learning model for training
            </p>
          </div>

          <div className="setting-item">
      <h3>User Management</h3> {error && <div className="error-message">{error}</div>}
      <form className="user-management-form" onSubmit={handleAddUser}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  className="form-input"
                  value={newUser.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  className="form-input"
                  value={newUser.password}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  className="form-input"
                  name="role"
                  value={newUser.role}
                  onChange={handleInputChange}
                >
                  <option value="ecologist">Ecologist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button 
                className="admin-button" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Processing..." : "Add User"}
              </button>
            </form>
            
            <div className="user-list">
              <h4>Existing Users</h4>
              {loading && users.length === 0 ? (
                <p>Loading users...</p>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button
                            className="action-button delete"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                          <button
                            className="action-button reset"
                            disabled
                            title="Coming soon"
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;