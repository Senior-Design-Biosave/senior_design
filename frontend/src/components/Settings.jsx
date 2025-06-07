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
          });
          fetchUsers(); // Refresh the user list
        } catch (err) {
          setError(err.response?.data?.error || "Failed to delete user");
          console.error("Error deleting user:", err);
        } finally {
          setLoading(false);
        }
      };

      const handleResetPassUser = async (userId) => {
        const newPassword = window.prompt("Enter new password for this user:");
      
        if (!newPassword) return;
      
        try {
          setLoading(true);
          await axios.put(`http://localhost:5000/api/users/${userId}/reset-password`, {
            newPassword,
          });
          alert("Password reset successfully");
        } catch (err) {
          setError(err.response?.data?.error || "Failed to reset password");
          console.error("Error resetting password:", err);
        } finally {
          setLoading(false);
        }
      };

  // Static data for demonstration
  const satelliteOptions = ["Sentinel-2", "Landsat 9", "MODIS", "Custom"];
  const colorPalettes = [
    { name: "Default", value: "default" },
    { name: "High Contrast", value: "high-contrast" },
    { name: "Colorblind Friendly", value: "colorblind" }
  ];

  //Display list of countries
  const [countryOptions, setCountryOptions] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [countriesError, setCountriesError] = useState(null);
  useEffect(() => {
    setCountriesLoading(true);
    axios.get("http://localhost:5000/api/country-settings")
      .then((res) => {
        console.log("Countries data:",res.data);
        const countryNames = res.data.map(row => row.name);
        setCountryOptions(countryNames);
        setCountriesError(null);
      })
      .catch((err) => {
        console.error("Failed to load countries", err);
        setCountriesError("Failed to load countries");
      })
      .finally(() => {
        setCountriesLoading(false);
      });
  }, []);

  return (
    <div className="settings-container">
      <style>{`
        .settings-container {
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .settings-title {
          color: #2c3e50;
          margin-bottom: 2rem;
          font-size: 2rem;
          font-weight: 600;
          border-bottom: 2px solid #ecf0f1;
          padding-bottom: 0.5rem;
        }
        
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 0rem;
        }
        
        .settings-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding-top: 1.5rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .full-width-card {
          grid-column: 1 / -1;
        }
        
        .settings-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        .card-header {
          color: #1a5f2a; /* Dark green */
          margin-bottom: 0.8rem;
          font-size: 1.25rem;
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .card-header svg {
          margin-right: 0.7rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0rem;
          font-weight: 500;
          color: #34495e;
        }
        
        .form-input {
          width: 97.5%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .form-input:focus {
          outline: none;
          border-color: #1a5f2a;
          box-shadow: 0 0 0 2px rgba(26, 95, 42, 0.2);
        }
        
        .select-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          background-color: white;
          font-size: 1rem;
          appearance: menulist;
          -webkit-appearance: menulist;
          -moz-appearance: menulist;
          position: relative;
          z-index: 1;
          margin-bottom: 1rem;
        }

        .select-input:focus {
           z-index: 2; /* Bring to front when focused */
        }
           
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-bottom: 1rem;
        }
        
        .radio-option {
          display: flex;
          align-items: center;
        }
        
        .radio-option input {
          margin-right: 0.5rem;
        }
        
        .button {
          padding: 0.75rem;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .button-primary {
          background-color: #1a5f2a; /* Dark green */
          color: white;
        }
        
        .button-primary:hover {
          background-color: #134821; /* Darker green */
        }
        
        .button-danger {
          background-color: #e74c3c;
          color: white;
        }
        
        .button-danger:hover {
          background-color: #c0392b;
        }
        
        .button-secondary {
          background-color: #5a8f69; /* Greenish gray */
          color: white;
          margin-bottom: 1.5rem;
          margin-right: 0.75rem;
        }
        
        .button-secondary:hover {
          background-color: #4a7a58; /* Darker greenish gray */
        }
        
        .button-sm {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        }
        
        .button-group {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .error-message {
          color: #e74c3c;
          background-color: #fadbd8;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .success-message {
          color: #27ae60;
          background-color: #d5f5e3;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-size: 0.875rem;
        }
        
        .users-table th {
          background-color: #f8f9fa;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #34495e;
          border-bottom: 2px solid #ddd;
        }
        
        .users-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #ddd;
          vertical-align: middle;
        }
        
        .users-table tr:last-child td {
          border-bottom: none;
        }
        
        .file-upload {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .file-upload input[type="file"] {
          margin-bottom: 0.9rem;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .admin-section {
          margin-top: 2rem;
          border-top: 2px solid #ecf0f1;
          padding-top: 0.5rem;
        }
        
        .admin-section-title {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }

        .text-muted {
          color: #6c757d;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          margin-bottom: 1.5rem;
        }
      `}</style>

      <h2 className="settings-title">General</h2>
      
      {/* Common Settings (for all users) */}
      <div className="settings-grid">
        <div className="settings-card">
          <div className="card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#1a5f2a"/>
              <path d="M19.4 15C19.2669 15.3016 19.227 15.6362 19.2855 15.9606C19.344 16.285 19.4982 16.5833 19.726 16.814C19.8427 16.9288 19.9375 17.0645 20.0056 17.2143C20.0737 17.364 20.1139 17.5252 20.1241 17.689L20.1429 18L20.1241 18.311C20.1139 18.4748 20.0737 18.636 20.0056 18.7857C19.9375 18.9355 19.8427 19.0712 19.726 19.186C19.4982 19.4167 19.344 19.715 19.2855 20.0394C19.227 20.3638 19.2669 20.6984 19.4 21C19.2669 21.3016 19.227 21.6362 19.2855 21.9606C19.344 22.285 19.4982 22.5833 19.726 22.814C19.8427 22.9288 19.9375 23.0645 20.0056 23.2143C20.0737 23.364 20.1139 23.5252 20.1241 23.689L20.1429 24H3.85714L3.87589 23.689C3.88614 23.5252 3.92625 23.364 3.99436 23.2143C4.06247 23.0645 4.15732 22.9288 4.274 22.814C4.5018 22.5833 4.65604 22.285 4.71451 21.9606C4.77298 21.6362 4.73314 21.3016 4.6 21C4.73314 20.6984 4.77298 20.3638 4.71451 20.0394C4.65604 19.715 4.5018 19.4167 4.274 19.186C4.15732 19.0712 4.06247 18.9355 3.99436 18.7857C3.92625 18.636 3.88614 18.4748 3.87589 18.311L3.85714 18L3.87589 17.689C3.88614 17.5252 3.92625 17.364 3.99436 17.2143C4.06247 17.0645 4.15732 16.9288 4.274 16.814C4.5018 16.5833 4.65604 16.285 4.71451 15.9606C4.77298 15.6362 4.73314 15.3016 4.6 15C4.73314 14.6984 4.77298 14.3638 4.71451 14.0394C4.65604 13.715 4.5018 13.4167 4.274 13.186C4.15732 13.0712 4.06247 12.9355 3.99436 12.7857C3.92625 12.636 3.88614 12.4748 3.87589 12.311L3.85714 12L3.87589 11.689C3.88614 11.5252 3.92625 11.364 3.99436 11.2143C4.06247 11.0645 4.15732 10.9288 4.274 10.814C4.5018 10.5833 4.65604 10.285 4.71451 9.96061C4.77298 9.63619 4.73314 9.30162 4.6 9C4.73314 8.69838 4.77298 8.36381 4.71451 8.03939C4.65604 7.71496 4.5018 7.41674 4.274 7.186C4.15732 7.07121 4.06247 6.93554 3.99436 6.78571C3.92625 6.63588 3.88614 6.47475 3.87589 6.31099L3.85714 6H20.1429L20.1241 6.31099C20.1139 6.47475 20.0737 6.63588 20.0056 6.78571C19.9375 6.93554 19.8427 7.07121 19.726 7.186C19.4982 7.41674 19.344 7.71496 19.2855 8.03939C19.227 8.36381 19.2669 8.69838 19.4 9C19.2669 9.30162 19.227 9.63619 19.2855 9.96061C19.344 10.285 19.4982 10.5833 19.726 10.814C19.8427 10.9288 19.9375 11.0645 20.0056 11.2143C20.0737 11.364 20.1139 11.5252 20.1241 11.689L20.1429 12L20.1241 12.311C20.1139 12.4748 20.0737 12.636 20.0056 12.7857C19.9375 12.9355 19.8427 13.0712 19.726 13.186C19.4982 13.4167 19.344 13.715 19.2855 14.0394C19.227 14.3638 19.2669 14.6984 19.4 15Z" fill="#1a5f2a"/>
            </svg>
            Satellite Imagery Source
          </div>
          <p className="text-muted">
            Choose which satellite imagery to use for analysis
          </p>
          <div className="form-group">
            <select className="select-input">
              {satelliteOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button className="button button-secondary">
                  Save
            </button>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 21C7 17.6863 9.68629 15 13 15C16.3137 15 19 17.6863 19 21H17C17 18.7909 15.2091 17 13 17C10.7909 17 9 18.7909 9 21H7ZM13 13C10.7909 13 9 11.2091 9 9C9 6.79086 10.7909 5 13 5C15.2091 5 17 6.79086 17 9C17 11.2091 15.2091 13 13 13ZM13 11C14.1046 11 15 10.1046 15 9C15 7.89543 14.1046 7 13 7C11.8954 7 11 7.89543 11 9C11 10.1046 11.8954 11 13 11ZM5 17.4722C5.68412 16.9445 6.41485 16.4894 7.18091 16.1155C6.49082 14.8445 6 13.4522 6 12C6 7.58172 9.58172 4 14 4C18.4183 4 22 7.58172 22 12C22 16.4183 18.4183 20 14 20C12.5465 20 11.1539 19.5083 9.88238 18.8169C9.50887 19.5841 9.05351 20.3161 8.5255 21H5V17.4722Z" fill="#1a5f2a"/>
            </svg>
            Color Palette
          </div>
          <p className="text-muted">
            Set color scheme for predicted vs actual data visualization
          </p>
          <div className="form-group">
            <div className="radio-group">
              {colorPalettes.map((palette) => (
                <div key={palette.value} className="radio-option">
                  <input
                    type="radio"
                    id={palette.value}
                    name="color-palette"
                    value={palette.value}
                  />
                  <label htmlFor={palette.value}>{palette.name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-card">
          <div className="card-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C15.866 2 19 5.13401 19 9C19 11.3883 17.6772 13.5051 15.6421 14.7426L16.0504 21.1339C16.0666 21.459 15.8051 21.7338 15.48 21.75C15.4547 21.7508 15.4294 21.7508 15.4041 21.75H8.59592C8.27078 21.7338 8.00932 21.459 8.02559 21.1339L8.43391 14.7426C6.39884 13.5051 5 11.3883 5 9C5 5.13401 8.13401 2 12 2ZM12 4C9.23858 4 7 6.23858 7 9C7 11.0503 8.2341 12.8124 10 13.584V16H14V13.584C15.7659 12.8124 17 11.0503 17 9C17 6.23858 14.7614 4 12 4ZM10.0504 19.75H13.9496L13.8421 18H10.1579L10.0504 19.75Z" fill="#1a5f2a"/>
            </svg>
            Default Map View
          </div>
          <p className="text-muted">
            Set the default zoom location when opening the map
          </p>
          <div className="form-group">
            <select className="select-input">
              {countriesLoading ? (
                <option>Loading countries...</option>
              ) : countriesError ? (
                <option>Error loading countries</option>
              ) : (
                <>
                  <option value="">Select a country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </>
              )}
            </select>
            <button className="button button-secondary">
                  Save
            </button>
          </div>
        </div>
      </div>

      {/* Admin-Only Settings */}
      {isAdmin && (
        <div className="admin-section">
          <h2 className="admin-section-title">Administrator Controls</h2>
          
          <div className="settings-grid">
            <div className="settings-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4ZM11 7V11H7V13H11V17H13V13H17V11H13V7H11Z" fill="#1a5f2a"/>
                </svg>
                Species Data Management
              </div>
              <p className="text-muted">
                Manage species database entries
              </p>
              <div className="button-group">
                <button className="button button-primary">
                  Add New Species
                </button>
                <button className="button button-danger">
                  Delete Species
                </button>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a5f2a" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2ZM6 4H13V9H18V20H6V4ZM8 12V14H16V12H8ZM8 16V18H13V16H8Z" fill="#1a5f2a"/>
                </svg>
                Bulk Data Import
              </div>
              <p className="text-muted">
                Import species data from spreadsheet (Excel/CSV)
              </p>
              <div className="file-upload">
                <input type="file" accept=".xlsx,.csv" />
                <button className="button button-secondary">
                  Upload Excel File
                </button>
              </div>
            </div>

            <div className="settings-card">
              <div className="card-header">
                <svg width="100" height="20" viewBox="0 0 24 24" fill="#1a5f2a" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 14H18L14.8033 20.3922C14.4689 21.0259 13.7561 21.3689 13.0723 21.2142L9.46534 20.4245C8.80546 20.2755 8.33296 19.6855 8.37219 19.0126L8.57434 15.2593C8.59132 14.9454 8.47174 14.6406 8.24264 14.4186L4.50253 10.786C3.97748 10.2749 3.93655 9.44255 4.41071 8.8837L7.56299 5.08687C7.84429 4.7569 8.28179 4.59082 8.72244 4.6454L12.5392 5.15793C13.3673 5.26099 14.0118 5.90668 14.1184 6.73537L14.5 10H20C20.5523 10 21 10.4477 21 11V13C21 13.5523 20.5523 14 20 14Z" fill="#1a5f2a"/>
                </svg>
                Model Upload
              </div>
              <p className="text-muted">
                Upload updated model for training
              </p>
              <div className="file-upload">
                <input type="file" accept=".h5,.pth,.model"/>
                <button className="button button-secondary">
                  Upload New Model
                </button>
              </div>
            </div>

            <div className="settings-card full-width-card">
              <div className="card-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a5f2a" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H18C18 18.6863 15.3137 16 12 16C8.68629 16 6 18.6863 6 22H4ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" fill="#1a5f2a"/>
                </svg>
                User Management
              </div>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleAddUser}>
                <div className="form-group">
                  <label>New user email:</label>
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
                  <label>New user password:</label>
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
                  <label>New user role:</label>
                  <select
                    className="select-input"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="ecologist">Ecologist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button 
                  className="button button-primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Processing...
                    </>
                  ) : "Add User"}
                </button>
              </form>
              
              <div className="form-group" style={{marginTop: '1.5rem'}}>
                <label>Existing Users:</label>
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
                              className="button button-secondary button-sm"
                              onClick={() => handleResetPassUser(user.id)}
                              disabled={loading}
                            >
                              Reset Password
                            </button>
                            <button
                              className="button button-danger button-sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={loading}
                            >
                              Delete
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
        </div>
      )}
    </div>
  );
}

export default Settings;