import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Bargraph from "./Bargraph";
import Piechart from "./Piechart";
import Heatmap from "./Heatmap2";
import Settings from "./Settings"
import AlphaBoxPlot from "./AlphaBoxPlot";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard"); // Track selected tab

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        {/* Pass setActiveTab to Sidebar */}
        <Sidebar setActiveTab={setActiveTab} />
        
        <main className="dashboard-main">
          {/* Show only when "Dashboard" is selected */}
          {activeTab === "dashboard" && (
            <>
              <h3>Diversity Metrics</h3>
              <Heatmap />
            </>
          )}

          {/* Show only when "Reports" is selected */}
          {activeTab === "reports" && (
            <>
              <Bargraph />
              <Piechart />
            </>
          )}

          {/* Show only when "Settings" is selected */}
          {activeTab === "settings" && (
            <>
              <Settings />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;