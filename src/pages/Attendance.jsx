// src/pages/Attendance.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Attendance = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState("Today");
  const [newAttendance, setNewAttendance] = useState({
    employeeId: "",
    action: "check-in",
  });
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
      fetchAttendance(token);
    }
  }, []);

  const checkTokenValidity = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
  };

  const fetchAttendance = async (token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/attendance?filter=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch attendance");
      }
      const data = await response.json();
      setAttendance(data || []); // Default to empty array if data is null/undefined
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleAddAttendance = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAttendance),
      });
      const data = await response.json();
      if (response.ok) {
        setNewAttendance({ employeeId: "", action: "check-in" });
        fetchAttendance(token);
      } else {
        throw new Error(data.message || "Failed to record attendance");
      }
    } catch (error) {
      console.error("Error adding attendance:", error);
    }
  };

  const handleDeleteAttendance = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/attendance/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        fetchAttendance(token);
      } else {
        throw new Error(data.message || "Failed to delete attendance");
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
    }
  };

  const filteredAttendance = Array.isArray(attendance)
    ? attendance.filter(
        (record) =>
          filter === "All" ||
          (filter.toLowerCase() === "today" &&
            new Date(record.timestamp).toDateString() ===
              new Date().toDateString())
      )
    : [];

  if (!isAuthenticated) return null;
  if (
    userRole !== "Admin" &&
    userRole !== "Manager" &&
    userRole !== "Office Staff"
  ) {
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
              Attendance
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
                  onClick={() => handleFilterChange("Today")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Today"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          {/* Add Attendance Form */}
          <form
            onSubmit={handleAddAttendance}
            className="glass p-4 rounded-xl mb-6"
          >
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Record New Attendance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Employee ID"
                value={newAttendance.employeeId}
                onChange={(e) =>
                  setNewAttendance({
                    ...newAttendance,
                    employeeId: e.target.value,
                  })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <select
                value={newAttendance.action}
                onChange={(e) =>
                  setNewAttendance({ ...newAttendance, action: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
              >
                <option value="check-in">Check-In</option>
                <option value="check-out">Check-Out</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
            >
              Record Attendance
            </button>
          </form>

          {/* Attendance List */}
          <div className="glass p-4 rounded-xl">
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Attendance List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--secondary-lavender)]">
                    <th className="p-2 text-left">Employee ID</th>
                    <th className="p-2 text-left">Action</th>
                    <th className="p-2 text-left">Timestamp</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredAttendance) &&
                    filteredAttendance.map((record) => (
                      <tr
                        key={record._id}
                        className="border-t border-[var(--border-gray)]"
                      >
                        <td className="p-2 text-[var(--text-gray)]">
                          {record.employeeId}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {record.action}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {new Date(record.timestamp).toLocaleString()}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeleteAttendance(record._id)}
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

export default Attendance;
