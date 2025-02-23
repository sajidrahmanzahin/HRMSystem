import React, { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const addNotification = () => {
    setNotifications((prev) =>
      [
        ...prev,
        {
          id: Date.now(),
          message: `New update: ${Math.floor(Math.random() * 100)}`,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
        },
      ].slice(-5)
    ); // Keep only the last 5 notifications
  };

  useEffect(() => {
    const notificationTimer = setInterval(addNotification, 10000);
    return () => clearInterval(notificationTimer);
  }, []);

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const toggleNotificationPanel = () => {
    setIsNotificationPanelOpen((prev) => !prev);
    if (!isNotificationPanelOpen) {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const value = {
    notifications,
    isNotificationPanelOpen,
    toggleNotificationPanel,
    markNotificationAsRead,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
