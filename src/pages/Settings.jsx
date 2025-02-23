// src/pages/Settings.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Settings = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [settings, setSettings] = useState({
    theme: "Dark",
    notifications: true,
    currency: "USD",
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
      fetchSettings(token);
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

  const fetchSettings = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(
        data || { theme: "Dark", notifications: true, currency: "USD" }
      );
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (response.ok) {
        fetchSettings(token);
      } else {
        throw new Error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const handleDeleteSettings = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete settings? This will reset to defaults."
      )
    ) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setSettings({ theme: "Dark", notifications: true, currency: "USD" });
        } else {
          throw new Error(data.message || "Failed to delete settings");
        }
      } catch (error) {
        console.error("Error deleting settings:", error);
      }
    }
  };

  if (!isAuthenticated) return null;
  if (userRole !== "Admin") {
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
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[var(--pale-blue-purple)] animate-slide-up">
              Settings
            </h1>
          </div>

          <form
            onSubmit={handleUpdateSettings}
            className="glass p-4 rounded-xl"
          >
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Application Settings
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({ ...settings, theme: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
              >
                <option value="Dark">Dark</option>
                <option value="Light">Light</option>
              </select>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      notifications: e.target.checked,
                    })
                  }
                  className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                />
                <span className="text-[var(--text-gray)]">
                  Enable Notifications
                </span>
              </label>
              <select
                value={settings.currency}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                type="submit"
                className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
              >
                Update Settings
              </button>
              <button
                type="button"
                onClick={handleDeleteSettings}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              >
                Delete Settings
              </button>
            </div>
          </form>
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

export default Settings;
