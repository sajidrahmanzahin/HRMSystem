// src/pages/Employees.jsx
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../components/Header";
import NotificationPanel from "../components/NotificationPanel";
import Sidebar from "../components/Sidebar";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Employees = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("All");
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
  });
  const [editingEmployee, setEditingEmployee] = useState(null);
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
      fetchEmployees(token);
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

  const fetchEmployees = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          return;
        }
        throw new Error("Failed to fetch employees");
      }
      const data = await response.json();
      setEmployees(data || []); // Default to empty array if data is null/undefined
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });
      const data = await response.json();
      if (response.ok) {
        setNewEmployee({ name: "", email: "", role: "", department: "" });
        fetchEmployees(token);
      } else {
        throw new Error(data.message || "Failed to add employee");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/employees/${editingEmployee._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editingEmployee),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setEditingEmployee(null);
        fetchEmployees(token);
      } else {
        throw new Error(data.message || "Failed to update employee");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (response.ok) {
        fetchEmployees(token);
      } else {
        throw new Error(data.message || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const filteredEmployees = Array.isArray(employees)
    ? employees.filter(
        (employee) => filter === "All" || employee.department === filter
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
              Employees
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
                  onClick={() => handleFilterChange("HR")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "HR"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  HR
                </button>
                <button
                  onClick={() => handleFilterChange("Engineering")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Engineering"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Engineering
                </button>
              </div>
            </div>
          </div>

          {/* Add Employee Form */}
          <form
            onSubmit={handleAddEmployee}
            className="glass p-4 rounded-xl mb-6"
          >
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Add New Employee
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, email: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <input
                type="text"
                placeholder="Role"
                value={newEmployee.role}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, role: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={newEmployee.department}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, department: e.target.value })
                }
                className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)]"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
            >
              Add Employee
            </button>
          </form>

          {/* Employee List */}
          <div className="glass p-4 rounded-xl">
            <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
              Employee List
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[var(--secondary-lavender)]">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                    <th className="p-2 text-left">Department</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredEmployees) &&
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="border-t border-[var(--border-gray)]"
                      >
                        <td className="p-2 text-[var(--text-gray)]">
                          {employee.name}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {employee.email}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {employee.role}
                        </td>
                        <td className="p-2 text-[var(--text-gray)]">
                          {employee.department}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="bg-[var(--soft-purple)] text-white px-2 py-1 rounded-lg text-sm hover-advanced mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee._id)}
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

          {/* Edit Employee Form (Modal) */}
          {editingEmployee && (
            <div className="fixed inset-0 bg-[var(--bg-charcoal)]/50 flex items-center justify-center">
              <div className="glass p-6 rounded-xl w-1/3">
                <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
                  Edit Employee
                </h2>
                <form onSubmit={handleUpdateEmployee} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Name"
                    value={editingEmployee.name}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        name: e.target.value,
                      })
                    }
                    className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={editingEmployee.email}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        email: e.target.value,
                      })
                    }
                    className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Role"
                    value={editingEmployee.role}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        role: e.target.value,
                      })
                    }
                    className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Department"
                    value={editingEmployee.department}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        department: e.target.value,
                      })
                    }
                    className="border border-[var(--border-gray)] rounded-lg p-2 text-[var(--text-gray)] bg-[var(--light-lavender)] w-full"
                    required
                  />
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditingEmployee(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
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

export default Employees;
