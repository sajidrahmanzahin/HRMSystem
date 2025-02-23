// src/pages/Reports.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Reports = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newReport, setNewReport] = useState({ type: "Employee", details: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login"; // Redirect to login if not authenticated
    } else {
      setIsAuthenticated(true);
      checkTokenValidity(token);
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      fetchReports(token);
    }
  }, []);

  const checkTokenValidity = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
        }
        throw new Error("Token validation failed");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
  };

  const fetchReports = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data || []); // Default to empty array if data is null/undefined
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReport),
      });
      const data = await response.json();
      if (response.ok) {
        setNewReport({ type: "Employee", details: "" });
        fetchReports(token);
      } else {
        throw new Error(data.message || "Failed to add report");
      }
    } catch (error) {
      console.error("Error adding report:", error);
    }
  };

  const handleDeleteReport = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchReports(token);
      } else {
        throw new Error(data.message || "Failed to delete report");
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => filter === "All" || report.type === filter)
    : [];

  if (!isAuthenticated) return null;
  if (userRole !== "Admin" && userRole !== "Manager") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-dark text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header
          unreadCount={unreadCount}
          toggleNotificationPanel={toggleNotificationPanel}
          toggleUserProfile={toggleUserProfile}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[var(--pale-blue-purple)] animate-slide-up">
              Reports
            </h1>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => handleFilterChange("All")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "All"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  All
                </button>
                <button
                  onClick={() => handleFilterChange("Employee")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Employee"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Employee
                </button>
                <button
                  onClick={() => handleFilterChange("Attendance")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Attendance"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => handleFilterChange("Payroll")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Payroll"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Payroll
                </button>
              </div>
            </div>
          </div>

          {/* Add Report Form */}
          <form
            onSubmit={handleAddReport}
            className="glass p-4 rounded-xl mb-6"
          >
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Add New Report
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <select
                value={newReport.type}
                onChange={(e) =>
                  setNewReport({ ...newReport, type: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
              >
                <option value="Employee">Employee</option>
                <option value="Attendance">Attendance</option>
                <option value="Payroll">Payroll</option>
              </select>
              <textarea
                placeholder="Details"
                value={newReport.details}
                onChange={(e) =>
                  setNewReport({ ...newReport, details: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full h-24"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
            >
              Add Report
            </button>
          </form>

          {/* Reports List */}
          <div className="glass p-4 rounded-xl">
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Reports List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--secondary-lavender)]">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Details</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredReports) &&
                    filteredReports.map((report) => (
                      <tr
                        key={report._id}
                        className="border-t border-[var(--border-gray)]"
                      >
                        <td className="p-2 text-[var(--text-gray)]">
                          {report.type}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {report.details}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {new Date(report.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeleteReport(report._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-lg text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      {/* Notification Panel (Modal) */}
      {isNotificationPanelOpen && (
        <div
          className="fixed inset-0 bg-[var(--bg-charcoal)]/50 flex items-center justify-center z-50"
          onClick={toggleNotificationPanel}
        >
          <NotificationPanel />
        </div>
      )}
      {/* User Profile Panel (Modal) */}
      {isUserProfileOpen && (
        <div
          className="fixed inset-0 bg-[var(--bg-charcoal)]/50 flex items-center justify-center z-50"
          onClick={toggleUserProfile}
        >
          <UserProfile onClose={toggleUserProfile} />
        </div>
      )}
    </div>
  );
};

export default Reports;
