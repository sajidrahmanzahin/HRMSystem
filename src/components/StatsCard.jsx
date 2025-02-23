// src/components/StatsCard.jsx
import React from "react";

const StatsCard = ({ title, value, change }) => {
  const isPositive = change.startsWith("+");
  return (
    <div className="glass p-4 rounded-xl hover:shadow-[0_0_20px_rgba(56,78,226,0.3)] transition-all animate-slide-up">
      <p className="text-sm text-[var(--secondary-lavender)]">{title}</p>
      <div className="mt-2 flex items-baseline">
        <h3 className="text-xl font-medium text-[var(--text-gray)]">{value}</h3>
        <span
          className={`ml-2 text-xs ${
            isPositive ? "text-[var(--accent-blue)]" : "text-red-500"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;
