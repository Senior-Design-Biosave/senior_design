import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Typical from "react-typical";
import axios from "axios";
import { useAuth } from "../AuthContext"; 

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [typingDone, setTypingDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); //to get the login function from auth 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      console.log("Attempting login with:", email); // Debug log
      const response = await axios.post("http://localhost:5000/api/signin", {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log("Server response:", response.data); // Debug log
      
      if (response.data.message === "Login successful") {
        login (response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard"); //all users will naviagate to common dashboard

        /*if (response.data.user.role === "admin") {
          navigate("/dashboard"); //for dmin navigation
        } else {
          navigate("/dashboard"); //for ecologist navigation
        }*/
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      if (err.response) {
        setError(err.response.data.error || "Login failed");
        console.log("Server error response:", err.response.data); // Debug log
      } else if (err.request) {
        setError("No response from server");
        console.log("No response received"); // Debug log
      } else {
        setError("Error setting up request");
        console.log("Request setup error:", err.message); // Debug log
      }
    } finally {
      setIsLoading(false);
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
            <button type="submit" className="signin-btn" disabled={isLoading}>{isLoading ? "Signing in..." : "Submit"}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;