// src/components/NotificationPanel.jsx
import React from "react";
import { useNotifications } from "../context/NotificationContext";

const NotificationPanel = ({ onClose }) => {
  const { notifications, markNotificationAsRead } = useNotifications();
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const unreadCount = safeNotifications.filter((notif) => !notif.read).length;

  return (
    <div className="w-96 bg-[var(--light-lavender)] text-[var(--text-gray)] rounded-xl shadow-lg p-6 border border-[var(--border-gray)] animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-medium text-[var(--primary-blue)]">
          Notifications {unreadCount > 0 ? `(${unreadCount} New)` : ""}
        </h2>
        <button
          onClick={onClose}
          className="text-[var(--text-gray)] hover:text-[var(--primary-blue)] text-lg font-bold"
          aria-label="Close notifications"
        >
          ×
        </button>
      </div>
      <ul className="space-y-2 max-h-80 overflow-y-auto">
        {safeNotifications.length > 0 ? (
          safeNotifications.map((notification) => (
            <li
              key={notification.id}
              className={`text-sm p-2 rounded-lg ${
                !notification.read ? "bg-[var(--secondary-lavender)]" : ""
              } cursor-pointer hover:bg-[var(--light-lavender)]/50`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <span className="text-[var(--soft-purple)]">
                {notification.timestamp}
              </span>{" "}
              - {notification.message}
              {!notification.read && (
                <span className="ml-2 text-xs text-[var(--primary-blue)]">
                  New
                </span>
              )}
            </li>
          ))
        ) : (
          <p className="text-sm text-[var(--pale-blue-purple)]">
            No new notifications.
          </p>
        )}
      </ul>
      {safeNotifications.length > 0 && (
        <button
          onClick={() =>
            safeNotifications.forEach((notif) =>
              markNotificationAsRead(notif.id)
            )
          }
          className="mt-4 w-full bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced text-sm font-medium"
        >
          Mark All as Read
        </button>
      )}
    </div>
  );
};

export default NotificationPanel;
