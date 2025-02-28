import React from "react";

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h2>Biodiversity Dashboard</h2>
      </div>
      <div className="header-right">
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>
    </header>
  );
}

export default Header;
