// src/pages/AccountSettings.jsx
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar"; // Default import
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const AccountSettings = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/"; // Redirect to login (/) if not authenticated
    } else {
      setIsAuthenticated(true);
      checkTokenValidity(token);
      fetchUser(token);
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
          window.location.href = "/"; // Redirect to login (/) on 401
        }
        throw new Error("Token validation failed");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
      window.location.href = "/"; // Redirect to login (/) on error
    }
  };

  const fetchUser = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/"; // Redirect to login (/) on 401
          return;
        }
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      setUser(data);
      setFormData({
        username: data.username,
        email: data.email || "",
        password: "",
        newPassword: "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("authToken");
      const body = {};
      if (formData.username) body.username = formData.username;
      if (formData.email) body.email = formData.email;
      if (formData.password && formData.newPassword) {
        body.password = formData.password;
        body.newPassword = formData.newPassword;
      }

      const response = await fetch("http://localhost:5000/api/auth/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Account updated successfully!");
        fetchUser(token); // Refresh user data
      } else {
        setError(data.message || "Failed to update account.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error updating account:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-dark text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        <Header
          unreadCount={unreadCount}
          toggleNotificationPanel={toggleNotificationPanel}
          toggleUserProfile={toggleUserProfile}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[var(--pale-blue-purple)] animate-slide-up">
              Account Settings
            </h1>
          </div>
          {user ? (
            <div className="glass p-4 rounded-xl">
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              {success && (
                <p className="text-[var(--accent-blue)] text-sm mb-4">
                  {success}
                </p>
              )}
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                />
                <input
                  type="password"
                  placeholder="Current Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                />
                <button
                  type="submit"
                  className="w-full bg-[var(--primary-blue)] text-white py-2 rounded-lg hover-advanced"
                >
                  Update Account
                </button>
              </form>
            </div>
          ) : (
            <p className="text-[var(--secondary-lavender)]">
              Loading account settings...
            </p>
          )}
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

export default AccountSettings;
