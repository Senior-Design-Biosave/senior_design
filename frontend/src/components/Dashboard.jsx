import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import PopulousAnimals from "./PopulousAnimals";
import RelativeAbundance from "./RelativeAbundance";
import Pointmap from "./Heatmap";
import Heatmap from "./Heatmap2";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <Sidebar />
        <main className="dashboard-main">
          <RelativeAbundance />
          <Pointmap/>
          <Heatmap/>
          <PopulousAnimals title="Populous Animals"/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
