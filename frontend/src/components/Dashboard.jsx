import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PopulousAnimals from "./PopulousAnimals";
import RelativeAbundance from "./RelativeAbundance";
import Heatmap from "./Heatmap";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="dashboard-main">
          <RelativeAbundance />
          <Heatmap/>
          <PopulousAnimals title="Populous Animals"/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
