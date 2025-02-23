// src/components/PerformanceMetrics.jsx
import React from "react";

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

export default PerformanceMetrics;
