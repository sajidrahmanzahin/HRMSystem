// src/App.jsx
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Sidebar from "./components/Sidebar";
import { NotificationProvider } from "./context/NotificationContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import AccountSettings from "./pages/AccountSettings";
import Attendance from "./pages/Attendance";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Feedback from "./pages/Feedback";
import Help from "./pages/Help";
import Login from "./pages/Login";
import Payroll from "./pages/Payroll";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UsersList from "./pages/UsersList";

// Custom protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("authToken");
  console.log(
    "Token in ProtectedRoute on Load:",
    token,
    "Path:",
    window.location.pathname
  ); // Debug token on load

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/" replace />; // Redirect to login (/) if not authenticated
  }

  let userRole = null;
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role;
    console.log("User Role on Load:", userRole, "Full Decoded Token:", decoded); // Debug role and full token
  } catch (error) {
    console.error("Error decoding token:", error, "Token:", token);
    localStorage.removeItem("authToken");
    console.log("Token removed due to decode error, redirecting to login");
    return <Navigate to="/" replace />; // Redirect to login (/) on token error
  }

  if (!userRole) {
    console.error("No role found in token, redirecting to login");
    localStorage.removeItem("authToken");
    return <Navigate to="/" replace />; // Redirect if no role in token
  }

  if (allowedRoles && !allowedRoles.includes(userRole?.toLowerCase() || "")) {
    console.log(
      "Access denied for role:",
      userRole,
      "Required roles:",
      allowedRoles,
      "Path:",
      window.location.pathname
    );
    return <Navigate to="/" replace />; // Redirect to login (/) if role not allowed
  }

  console.log(
    "Access granted for role:",
    userRole,
    "to path:",
    window.location.pathname
  );
  return children;
};

// Install jwt-decode for token decoding
// npm install jwt-decode
import { jwtDecode } from "jwt-decode";

function App() {
  console.log(
    "Rendering App, checking Sidebar, Sidebar DOM:",
    document.querySelector(".sidebar")
  ); // Debug App rendering and Sidebar DOM
  return (
    <UserProfileProvider>
      <NotificationProvider>
        <ErrorBoundary>
          <Router>
            <div className="flex h-screen bg-dark text-white overflow-hidden">
              {/* Ensure Sidebar is rendered for all authenticated users */}
              {localStorage.getItem("authToken") ? <Sidebar /> : null}
              <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
                <Routes>
                  <Route path="/" element={<Login />} />{" "}
                  {/* Root path now points to Login */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />{" "}
                  {/* Dashboard moved to /dashboard */}
                  <Route
                    path="/employees"
                    element={
                      <ProtectedRoute>
                        <Employees />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/attendance"
                    element={
                      <ProtectedRoute>
                        <Attendance />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/payroll"
                    element={
                      <ProtectedRoute>
                        <Payroll />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute>
                        <Reports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account-settings"
                    element={
                      <ProtectedRoute>
                        <AccountSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/help"
                    element={
                      <ProtectedRoute>
                        <Help />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/feedback"
                    element={
                      <ProtectedRoute>
                        <Feedback />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={["Admin", "Support"]}>
                        <UsersList />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/logout" element={<Navigate to="/" replace />} />{" "}
                  {/* Redirect to login (/) on logout */}
                </Routes>
              </div>
            </div>
          </Router>
        </ErrorBoundary>
      </NotificationProvider>
    </UserProfileProvider>
  );
}

export default App;
