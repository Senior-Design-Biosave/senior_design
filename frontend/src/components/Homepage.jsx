import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="homepage-container">
      <h1>Biosave</h1>

      <img src="/images/homepage.png" alt="homepage_image" className="homepage-image" />

      <p>
        Welcome to a Deep Learning System for Non-Intrusive Biodiversity Assessment using Satellite Data.
      </p>
      <div className="auth-buttons">
      <Link to="/Signin">
        <button className="signin-btn">Sign In</button>
      </Link>
      </div>
    </div>
  );
}

export default HomePage;
