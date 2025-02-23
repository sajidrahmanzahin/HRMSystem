// src/pages/UsersList.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const UsersList = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "Office Staff",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("Token in UsersList:", token); // Debug token

    if (!token) {
      console.log("No token found, redirecting to login");
      window.location.href = "/"; // Redirect to login (/) if not authenticated
      return;
    }

    setIsAuthenticated(true);
    checkTokenValidity(token);

    try {
      const decoded = jwtDecode(token);
      console.log("Decoded Token Payload in UsersList:", decoded); // Debug full decoded token
      const role = decoded.role;
      if (!role) {
        console.error("No role found in token, redirecting to login");
        localStorage.removeItem("authToken");
        window.location.href = "/"; // Redirect to login (/) if no role
        return;
      }
      console.log("Decoded Role in UsersList:", role); // Debug role
      setUserRole(role);
      fetchUsers(token);
    } catch (error) {
      console.error("Error decoding token in UsersList:", error);
      localStorage.removeItem("authToken");
      console.log("Token removed due to decode error, redirecting to login");
      window.location.href = "/"; // Redirect to login (/) on error
    }
  }, []);

  const checkTokenValidity = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Token Validation Response:", response); // Debug response
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          console.log("Token invalid, redirecting to login");
          window.location.href = "/"; // Redirect to login (/) on 401
        }
        throw new Error("Token validation failed");
      }
    } catch (error) {
      console.error("Token validation error:", error);
      localStorage.removeItem("authToken");
      console.log("Token validation error, redirecting to login");
      window.location.href = "/"; // Redirect to login (/) on error
    }
  };

  const fetchUsers = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Users API Response:", response); // Debug response
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          console.log("Unauthorized access to users, redirecting to login");
          window.location.href = "/"; // Redirect to login (/) on 401
          return;
        } else if (response.status === 403) {
          console.log("Forbidden access to users, redirecting to login");
          return <Navigate to="/" replace />;
        }
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      console.log("Users Data:", data); // Debug response data
      setUsers(data || []); // Default to empty array if data is null/undefined
    } catch (error) {
      setError("Failed to load users. Please try again.");
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("User created successfully!");
        setNewUser({
          username: "",
          email: "",
          password: "",
          role: "Office Staff",
        });
        fetchUsers(token);
      } else {
        setError(data.message || "Failed to create user.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error creating user:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:5000/api/auth/users/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setSuccess("User deleted successfully!");
          fetchUsers(token);
        } else {
          setError(data.message || "Failed to delete user.");
        }
      } catch (error) {
        setError("An error occurred. Please try again.");
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/auth/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSuccess("User role updated successfully!");
        fetchUsers(token);
      } else {
        setError(data.message || "Failed to update user role.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error updating user role:", error);
    }
  };

  if (!isAuthenticated) return null;
  if (userRole !== "Admin" && userRole !== "Support") {
    console.log("Redirecting due to insufficient role:", userRole);
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
              Users List
            </h1>
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && (
            <p className="text-[var(--accent-blue)] text-sm mb-4">{success}</p>
          )}

          {/* Create New User Form */}
          <form
            onSubmit={handleCreateUser}
            className="glass p-4 rounded-xl mb-6"
          >
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Create New User
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
              >
                <option value="Office Staff">Office Staff</option>
                <option value="Manager">Manager</option>
                <option value="Support">Support</option>
                {userRole === "Admin" && <option value="Admin">Admin</option>}
              </select>
            </div>
            <button
              type="submit"
              className="mt-4 bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
            >
              Create User
            </button>
          </form>

          {/* Users List */}
          <div className="glass p-4 rounded-xl">
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Existing Users
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--secondary-lavender)]">
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(users) &&
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-t border-[var(--border-gray)]"
                      >
                        <td className="p-2 text-[var(--text-gray)]">
                          {user.username}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {user.email || "N/A"}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {user.role}
                        </td>
                        <td className="p-2">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateRole(user._id, e.target.value)
                            }
                            className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                          >
                            <option value="Office Staff">Office Staff</option>
                            <option value="Manager">Manager</option>
                            <option value="Support">Support</option>
                            {userRole === "Admin" && (
                              <option value="Admin">Admin</option>
                            )}
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="ml-2 bg-red-500 text-white px-2 py-1 rounded-lg text-sm hover:bg-red-600"
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

export default UsersList;
