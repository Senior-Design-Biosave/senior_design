import React from "react";
import { useNavigate } from "react-router-dom";

function Sidebar({ setActiveTab }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <h3>BIOSAVE</h3>
      <ul>
        <li onClick={() => setActiveTab("dashboard")}>Dashboard</li>
        <li onClick={() => setActiveTab("reports")}>Reports</li>
        <li onClick={() => setActiveTab("settings")}>Settings</li>
        <li onClick={handleLogout} className="logout-btn">Logout</li>
      </ul>
    </aside>
  );
}

export default Sidebar;