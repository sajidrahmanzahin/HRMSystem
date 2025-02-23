// src/components/Sidebar.jsx (quick verification)
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Sidebar Token on Load:", token); // Debug token on load
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(
          "Sidebar Decoded Role:",
          decoded.role,
          "Full Decoded Token:",
          decoded
        ); // Debug role and full token
        setUserRole(decoded.role || null); // Fallback to null if role is missing
      } catch (error) {
        console.error(
          "Error decoding token in Sidebar:",
          error,
          "Token:",
          token
        );
        localStorage.removeItem("authToken");
        setUserRole(null);
      }
    } else {
      console.log("No token, setting userRole to null");
      setUserRole(null);
    }
  }, []); // Empty dependency array ensures this runs only on mount

  const toggleSidebar = () => {
    console.log(
      "Toggling sidebar, current state:",
      isOpen,
      "userRole:",
      userRole
    ); // Debug toggle state
    setIsOpen((prev) => !prev); // Use functional update to ensure correct state
  };

  // Close sidebar if clicking outside (optional, depending on layout)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".sidebar")) {
        console.log("Click outside sidebar, closing, userRole:", userRole); // Debug click outside
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, userRole]); // Added userRole to ensure re-registration on role change

  // Ensure all menus are visible for all authenticated users, except "Users List" for Admin/Support only
  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: "🏠" }, // Always visible for authenticated users
    { path: "/employees", name: "Employees", icon: "👤" }, // Visible for all authenticated users
    { path: "/attendance", name: "Attendance", icon: "🕒" }, // Visible for all authenticated users
    { path: "/payroll", name: "Payroll", icon: "💰" }, // Visible for all authenticated users
    { path: "/reports", name: "Reports", icon: "📊" }, // Visible for all authenticated users
    { path: "/settings", name: "Settings", icon: "⚙️" }, // Visible for all authenticated users
    { path: "/profile", name: "Profile", icon: "👤" }, // Visible for all authenticated users
    { path: "/account-settings", name: "Account Settings", icon: "🔧" }, // Visible for all authenticated users
    { path: "/help", name: "Help", icon: "❓" }, // Visible for all authenticated users
    { path: "/feedback", name: "Feedback", icon: "📧" }, // Visible for all authenticated users
    ...(userRole && ["Admin", "Support"].includes(userRole?.toLowerCase() || "")
      ? [{ path: "/users", name: "Users List", icon: "👥" }]
      : []), // Only for Admin/Support
  ];

  console.log(
    "Rendering Sidebar, isOpen:",
    isOpen,
    "userRole:",
    userRole,
    "navItems:",
    navItems
  ); // Debug rendering and navItems

  // Only render sidebar if authenticated (token exists)
  if (!localStorage.getItem("authToken")) {
    console.log("No authToken, not rendering Sidebar");
    return null; // Don’t render sidebar for unauthenticated users
  }

  return (
    <div
      className={`sidebar ${isOpen ? "open" : ""} 
      bg-gradient-to-b from-[#1a202c] to-[#2d3748] 
      text-white w-64 p-4 fixed h-screen shadow-xl 
      backdrop-blur-lg bg-opacity-95 transition-all duration-300 
      ${isOpen ? "z-[60] translate-x-0" : "z-50 -translate-x-full"}`} // Ensure visible when open, hidden off-screen when closed
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5678e6] to-[#8a6ed1] animate-pulse-slow">
          HRM Dashboard
        </h2>
        <button
          onClick={toggleSidebar}
          className="text-2xl focus:outline-none p-2 rounded-full bg-[#5678e6]/20 hover:bg-[#5678e6]/40 transition-colors duration-200 group"
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          onKeyPress={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleSidebar();
            }
          }}
        >
          <span className="group-hover:scale-110 transition-transform duration-200">
            {isOpen ? "×" : "☰"}
          </span>
        </button>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg hover:bg-[#5678e6]/10 hover:text-[#8a6ed1] 
              transition-all duration-200 ${
                isActive
                  ? "bg-[#5678e6]/20 text-[#8a6ed1] font-semibold shadow-inner"
                  : "text-[#a0aec0]"
              }`
            }
            onClick={() => isOpen && setIsOpen(false)} // Optionally close on link click
          >
            <span className="mr-3 text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
