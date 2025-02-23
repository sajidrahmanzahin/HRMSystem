// src/pages/Dashboard.jsx
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { jwtDecode } from "jwt-decode"; // Correct named import
import React, { useEffect, useState } from "react";
import CallToAction from "../components/CallToAction";
import EmployeeChart from "../components/EmployeeChart";
import Header from "../components/Header";
import RecentActivity from "../components/RecentActivity";
import Sidebar from "../components/Sidebar";
import StatsCard from "../components/StatsCard";
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Dashboard = () => {
  const { isNotificationPanelOpen, toggleNotificationPanel, unreadCount } =
    useNotifications();
  const { isUserProfileOpen, toggleUserProfile } = useUserProfile();
  const [filter, setFilter] = useState("All");
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [widgets, setWidgets] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/"; // Redirect to login (/) if not authenticated
    } else {
      setIsAuthenticated(true);
      checkTokenValidity(token);
      const decoded = jwtDecode(token);
      setUserRole(decoded.role);
      // Set widgets based on role
      setWidgets([
        { id: "stats", content: <StatsCards role={decoded.role} /> },
        ...(decoded.role === "Admin" || decoded.role === "Manager"
          ? [
              { id: "charts", content: <EmployeeChart filter={filter} /> },
              { id: "activity", content: <RecentActivity filter={filter} /> },
              { id: "performance", content: <PerformanceMetrics /> },
            ]
          : []),
      ]);
    }
    const timer = setInterval(
      () => setTime(new Date().toLocaleTimeString()),
      1000
    );
    return () => clearInterval(timer);
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

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newWidgets = Array.from(widgets);
    const [reorderedItem] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedItem);
    setWidgets(newWidgets);
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[var(--pale-blue-purple)] animate-slide-up">
              Overview
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-[var(--secondary-lavender)]">
                Current Time: {time}
              </span>
              <div className="flex space-x-4">
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
                <button
                  onClick={() => handleFilterChange("Week")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Week"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Week
                </button>
                <button
                  onClick={() => handleFilterChange("Month")}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    filter === "Month"
                      ? "bg-[var(--primary-blue)] text-white"
                      : "bg-[var(--secondary-lavender)] text-[var(--text-gray)]"
                  } hover-advanced`}
                >
                  Month
                </button>
              </div>
            </div>
          </div>

          {/* Drag and Drop Widgets (only for Admin/Manager) */}
          {userRole === "Admin" || userRole === "Manager" ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  >
                    {widgets.map((widget, index) => (
                      <Draggable
                        key={widget.id}
                        draggableId={widget.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`draggable-card ${
                              snapshot.isDragging ? "dragging" : ""
                            } animate-fade-in`}
                          >
                            {widget.content}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="glass p-4 rounded-xl">
              <p className="text-[var(--secondary-lavender)]">
                Limited access for {userRole}. Contact an Admin for full
                dashboard access.
              </p>
            </div>
          )}

          {/* Call to Action Banner (for all roles, optional) */}
          <CallToAction />
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

// Helper component for Stats Cards (updated for roles)
const StatsCards = ({ role }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {role === "Admin" || role === "Manager" ? (
      <>
        <StatsCard title="Total Employees" value="1,234" change="+12%" />
        <StatsCard title="Active Projects" value="45" change="+5%" />
        <StatsCard title="Pending Leaves" value="12" change="-2%" />
        <StatsCard title="Open Positions" value="8" change="+3%" />
      </>
    ) : (
      <StatsCard title="Total Employees" value="Limited View" change="N/A" />
    )}
  </div>
);

const PerformanceMetrics = () => {
  const metrics = [
    {
      title: "Employee Satisfaction",
      value: "87%",
      color: "var(--accent-blue)",
    },
    { title: "Project Completion", value: "92%", color: "var(--soft-purple)" },
    { title: "Attendance Rate", value: "95%", color: "var(--primary-blue)" },
  ];

  return (
    <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
      <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
        Performance Metrics
      </h2>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-[var(--pale-blue-purple)]">
              {metric.title}
            </span>
            <span
              className="text-sm font-medium text-[var(--text-gray)]"
              style={{ color: metric.color }}
            >
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
