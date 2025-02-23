// src/pages/Login.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Attempting login with credentials:", credentials); // Debug login attempt
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      console.log("Login API Response:", response); // Debug API response
      const data = await response.json();
      console.log("Login Response Data:", data); // Debug response data

      if (response.ok) {
        localStorage.setItem("authToken", data.token); // Store token
        try {
          const decoded = jwtDecode(data.token);
          console.log("Decoded Token Payload:", decoded); // Debug decoded token
          console.log("User Role:", decoded.role); // Debug role
          localStorage.setItem("userRole", decoded.role); // Store role for frontend use
          navigate("/dashboard"); // Redirect to dashboard (/dashboard) after login
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
          setError("Invalid token format. Please try again.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userRole");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex h-screen bg-dark text-white">
      <div className="flex-1 flex items-center justify-center">
        <div className="glass p-6 rounded-xl w-96">
          <h1 className="text-xl font-bold text-[var(--pale-blue-purple)] mb-4">
            Login
          </h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) =>
                setCredentials({ ...credentials, username: e.target.value })
              }
              className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
              required
            />
            <button
              type="submit"
              className="w-full bg-[var(--primary-blue)] text-white py-2 rounded-lg hover-advanced"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
