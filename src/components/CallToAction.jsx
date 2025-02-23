// src/components/CallToAction.jsx
import React from "react";

const CallToAction = () => {
  return (
    <div className="mt-6 glass p-4 rounded-xl shadow-[0_0_15px_rgba(56,78,226,0.3)] flex items-center justify-between hover:shadow-[0_0_25px_rgba(56,78,226,0.5)] transition-all">
      <div>
        <h3 className="text-sm font-medium text-[var(--secondary-lavender)]">
          Get advanced HRM analytics
        </h3>
        <p className="text-xs mt-1 text-[var(--pale-blue-purple)]">
          Upgrade to Pro for real-time insights, AI-powered features, and more.
        </p>
      </div>
      <button className="bg-[var(--light-lavender)] text-[var(--primary-blue)] px-4 py-2 rounded-lg hover-advanced text-sm font-medium">
        Upgrade Now
      </button>
    </div>
  );
};

export default CallToAction;
