// src/context/UserProfileContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const UserProfileContext = createContext();

export function UserProfileProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ role: decoded.role }); // Set user with role from token
      } catch (error) {
        console.error("Error decoding token in UserProfileContext:", error);
        localStorage.removeItem("authToken");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []); // Run once on mount

  const value = { user, setUser };
  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export const useUserProfile = () => useContext(UserProfileContext);
