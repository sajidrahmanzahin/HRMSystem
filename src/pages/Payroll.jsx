// src/pages/Payroll.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Payroll = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [payrolls, setPayrolls] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newPayroll, setNewPayroll] = useState({
    employeeId: "",
    amount: "",
    period: "Monthly",
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
      fetchPayrolls(token);
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

  const fetchPayrolls = async (token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/payrolls?filter=${filter}`,
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
        throw new Error("Failed to fetch payrolls");
      }
      const data = await response.json();
      setPayrolls(data || []); // Default to empty array if data is null/undefined
    } catch (error) {
      console.error("Error fetching payrolls:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleAddPayroll = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/payrolls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPayroll),
      });
      const data = await response.json();
      if (response.ok) {
        setNewPayroll({ employeeId: "", amount: "", period: "Monthly" });
        fetchPayrolls(token);
      } else {
        throw new Error(data.message || "Failed to add payroll");
      }
    } catch (error) {
      console.error("Error adding payroll:", error);
    }
  };

  const handleDeletePayroll = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:5000/api/payrolls/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        fetchPayrolls(token);
      } else {
        throw new Error(data.message || "Failed to delete payroll");
      }
    } catch (error) {
      console.error("Error deleting payroll:", error);
    }
  };

  const filteredPayrolls = Array.isArray(payrolls)
    ? payrolls.filter(
        (payroll) => filter === "All" || payroll.period === filter
      )
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
              Payroll
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
                  onClick={() => handleFilterChange("Monthly")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Monthly"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => handleFilterChange("Quarterly")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Quarterly"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Quarterly
                </button>
              </div>
            </div>
          </div>

          {/* Add Payroll Form */}
          <form
            onSubmit={handleAddPayroll}
            className="glass p-4 rounded-xl mb-6"
          >
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Add New Payroll
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Employee ID"
                value={newPayroll.employeeId}
                onChange={(e) =>
                  setNewPayroll({ ...newPayroll, employeeId: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={newPayroll.amount}
                onChange={(e) =>
                  setNewPayroll({ ...newPayroll, amount: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <select
                value={newPayroll.period}
                onChange={(e) =>
                  setNewPayroll({ ...newPayroll, period: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
            >
              Add Payroll
            </button>
          </form>

          {/* Payroll List */}
          <div className="glass p-4 rounded-xl">
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Payroll List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--secondary-lavender)]">
                    <th className="p-2 text-left">Employee ID</th>
                    <th className="p-2 text-left">Amount</th>
                    <th className="p-2 text-left">Period</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredPayrolls) &&
                    filteredPayrolls.map((payroll) => (
                      <tr
                        key={payroll._id}
                        className="border-t border-[var(--border-gray)]"
                      >
                        <td className="p-2 text-[var(--text-gray)]">
                          {payroll.employeeId}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          ${payroll.amount}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {payroll.period}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {new Date(payroll.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleDeletePayroll(payroll._id)}
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

export default Payroll;
