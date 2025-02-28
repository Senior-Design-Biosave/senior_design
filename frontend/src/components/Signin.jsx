import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typical from "react-typical";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [typingDone, setTypingDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email === "test@example.com" && password === "password") {
      navigate("/dashboard");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="signin-background">
       {/* Left Side - Typewriter Effect */}
       <div className="signin-left">
          {!typingDone ? (
            <Typical 
              className="typewriter-text"
              steps={["A Deep Learning System for Non-Intrusive Biodiversity Assessment using Satellite Data", 4000]} 
              wrapper="h1" 
              onComplete={() => setTypingDone(true)} 
            />
          ) : (
            <h1 className="typewriter-text">Biosave</h1>
          )}
        </div>
      <div className="signin-container">
       

        {/* Right Side - Sign-in Form */}
        <div className="signin-right">
          <h2>Sign In</h2>
          <form onSubmit={handleSubmit} className="signin-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="signin-btn">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;