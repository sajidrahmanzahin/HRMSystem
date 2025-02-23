// src/pages/Settings.jsx (partial update, ensure auth token is included)
useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/"; // Redirect to login if not authenticated
  } else {
    setIsAuthenticated(true);
    checkTokenValidity(token);
    fetchSettings(token); // Pass token to fetchSettings
  }
}, []);

const fetchSettings = async (token) => {
  try {
    const response = await fetch("http://localhost:5000/api/settings", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/";
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
