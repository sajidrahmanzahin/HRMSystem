// src/components/Header.jsx
import { Menu, Transition } from "@headlessui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce"; // Ensure this is installed
import { useNotifications } from "../context/NotificationContext";
import { useUserProfile } from "../context/UserProfileContext";

const Header = () => {
  const { notifications, unreadCount, toggleNotificationPanel } =
    useNotifications();
  const { toggleUserProfile } = useUserProfile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300); // Debounce with 300ms delay
  const [searchResults, setSearchResults] = useState([]);
  const [theme, setTheme] = useState("Dark");
  const [userStatus, setUserStatus] = useState("Online");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTheme();
    // Simulate user status updates (e.g., online/offline toggle every 30 seconds)
    const statusTimer = setInterval(() => {
      setUserStatus((prev) => (prev === "Online" ? "Offline" : "Online"));
    }, 30000);
    return () => clearInterval(statusTimer);
  }, []);

  const fetchTheme = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings");
      const data = await response.json();
      setTheme(data.theme || "Dark");
    } catch (error) {
      console.error("Error fetching theme:", error);
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === "Dark" ? "Light" : "Dark";
    setTheme(newTheme);
    try {
      await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });
      // Update document body class for theme switching
      document.body.className =
        newTheme === "Light" ? "light-theme" : "dark-theme";
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  };

  const handleSearch = async () => {
    if (debouncedSearchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/search?q=${encodeURIComponent(
          debouncedSearchQuery
        )}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [debouncedSearchQuery]);

  const handleMenuItemClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback();
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          // Call backend logout endpoint (optional, for server-side logging)
          await fetch("http://localhost:5000/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
        }
        // Clear client-side token
        localStorage.removeItem("authToken");
        // Redirect to login page
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
        alert("Failed to log out. Please try again.");
      }
    }
  };

  return (
    <header
      className={`bg-dark border-b border-[var(--border-gray)] p-6 flex justify-between items-center ${
        theme === "Light" ? "bg-white text-[var(--text-gray)]" : ""
      }`}
    >
      <div className="relative w-1/3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search anything here..."
          className="w-full border border-[var(--border-gray)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-[var(--accent-blue)] bg-[var(--light-lavender)] text-[var(--text-gray)] placeholder-gray-500"
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--secondary-lavender)]">
            Loading...
          </span>
        )}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white rounded-lg shadow-md mt-2 border border-[var(--border-gray)] z-20">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="p-2 text-[var(--text-gray)] hover:bg-[var(--light-lavender)] cursor-pointer"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  navigate(`/${result.type.toLowerCase()}/${result.id}`);
                }}
              >
                {result.name || result.title} - {result.type}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-6">
        <button
          onClick={toggleNotificationPanel}
          className="relative p-3 text-[var(--secondary-lavender)] header-button-hover transition-all"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--primary-blue)] text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <Menu as="div" className="relative">
          <Menu.Button className="p-3 text-[var(--secondary-lavender)] header-button-hover transition-all">
            ⚙️
          </Menu.Button>
          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md py-2 border border-[var(--border-gray)] z-60">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active
                        ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                        : "text-[var(--text-gray)]"
                    } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                    onClick={(e) =>
                      handleMenuItemClick(e, () => navigate("/profile"))
                    }
                  >
                    Profile
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={(e) => handleMenuItemClick(e, handleThemeToggle)}
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      active
                        ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                        : "text-[var(--text-gray)]"
                    } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                  >
                    Switch to {theme === "Dark" ? "Light" : "Dark"} Mode
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active
                        ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                        : "text-[var(--text-gray)]"
                    } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                    onClick={(e) =>
                      handleMenuItemClick(e, () =>
                        navigate("/account-settings")
                      )
                    }
                  >
                    Account Settings
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active
                        ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                        : "text-[var(--text-gray)]"
                    } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                    onClick={(e) =>
                      handleMenuItemClick(e, () =>
                        window.open("https://example.com/help", "_blank")
                      )
                    }
                  >
                    Help
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active
                        ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                        : "text-[var(--text-gray)]"
                    } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                    onClick={(e) =>
                      handleMenuItemClick(e, () =>
                        window.open("https://example.com/feedback", "_blank")
                      )
                    }
                  >
                    Feedback
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`block px-4 py-2 text-sm ${
                      active
                        ? "bg-[var(--light-lavender)] text-red-500"
                        : "text-red-500"
                    } hover:bg-[var(--light-lavender)] hover:text-red-700 transition-all`}
                    onClick={(e) => handleMenuItemClick(e, handleLogout)}
                  >
                    Logout
                  </a>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
        <div className="flex items-center space-x-2">
          <span
            className={`text-sm ${
              userStatus === "Online"
                ? "text-[var(--accent-blue)]"
                : "text-red-500"
            }`}
          >
            {userStatus}
          </span>
          <Menu as="div" className="relative">
            <Menu.Button className="w-10 h-10 bg-[var(--light-lavender)] rounded-full flex items-center justify-center text-sm font-medium text-[var(--text-gray)] cursor-pointer hover-advanced profile-hover">
              JD
            </Menu.Button>
            <Transition
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-md py-2 border border-[var(--border-gray)] z-60">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={`block px-4 py-2 text-sm ${
                        active
                          ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                          : "text-[var(--text-gray)]"
                      } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                      onClick={(e) =>
                        handleMenuItemClick(e, () => navigate("/profile"))
                      }
                    >
                      Profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={`block px-4 py-2 text-sm ${
                        active
                          ? "bg-[var(--light-lavender)] text-[var(--primary-blue)]"
                          : "text-[var(--text-gray)]"
                      } hover:bg-[var(--light-lavender)] hover:text-[var(--primary-blue)] transition-all`}
                      onClick={(e) =>
                        handleMenuItemClick(e, () =>
                          navigate("/account-settings")
                        )
                      }
                    >
                      Account Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={`block px-4 py-2 text-sm ${
                        active
                          ? "bg-[var(--light-lavender)] text-red-500"
                          : "text-red-500"
                      } hover:bg-[var(--light-lavender)] hover:text-red-700 transition-all`}
                      onClick={(e) => handleMenuItemClick(e, handleLogout)}
                    >
                      Logout
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;
