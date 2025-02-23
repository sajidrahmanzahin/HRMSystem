// src/components/RecentActivity.jsx
import React, { useEffect, useState } from "react";

const RecentActivity = ({ filter }) => {
  const [activities, setActivities] = useState([
    { time: "09:15 AM", description: "New employee onboarded: Jane Doe" },
    { time: "10:30 AM", description: "Leave request approved for John Smith" },
    { time: "11:45 AM", description: "Payroll processed for Q1 2025" },
  ]);

  useEffect(() => {
    // Simulate real-time updates (e.g., new activity every 5 seconds)
    const interval = setInterval(() => {
      setActivities((prev) =>
        [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            description: `New activity logged: Update ${Math.floor(
              Math.random() * 100
            )}`,
          },
        ].slice(-5)
      ); // Keep only the last 5 activities
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
      <h2 className="text-sm font-medium text-[var(--secondary-lavender)] mb-4">
        Recent Activity
      </h2>
      <ul className="space-y-3">
        {activities.map((activity, index) => (
          <li key={index} className="flex items-center text-sm animate-fade-in">
            <span className="text-[var(--pale-blue-purple)] mr-3">
              {activity.time}
            </span>
            <span className="text-[var(--secondary-lavender)]">
              {activity.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
