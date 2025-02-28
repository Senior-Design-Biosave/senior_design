/*import React from "react";

function Sidebar() {
  const menuItems = ["Dashboard", "Reports", "Settings", "Logout"];

  return (
    <aside className="sidebar">
      <h3>BIOSAVE</h3>
      <ul>
        {menuItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;*/

import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function Sidebar() {
  const navigate = useNavigate(); // Initialize navigate function

  const handleLogout = () => {
    // Clear user session if needed (e.g., remove token from localStorage)
    //localStorage.removeItem("authToken"); // Adjust based on your auth setup

    // Redirect to homepage
    navigate("/");
  };

  const menuItems = ["Dashboard", "Reports", "Settings"];

  return (
    <aside className="sidebar">
      <h3>BIOSAVE</h3>
      <ul>
        {menuItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
        <li onClick={handleLogout} className="logout-btn">Logout</li>
      </ul>
    </aside>
  );
}

export default Sidebar;

