// src/components/UserProfile.jsx
import React from "react";

const UserProfile = () => {
  return (
    <div className="w-72 bg-dark border-l border-[var(--border-gray)] shadow-[0_0_10px_rgba(56,78,226,0.1)] p-6 fixed right-0 top-0 h-screen">
      <h2 className="text-xl font-bold text-[var(--pale-blue-purple)] mb-4">
        User Profile
      </h2>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-[var(--light-lavender)] rounded-full flex items-center justify-center text-lg font-medium text-[var(--primary-blue)]">
            JD
          </div>
          <div>
            <h3 className="text-base font-medium text-[var(--secondary-lavender)]">
              John Doe
            </h3>
            <p className="text-sm text-[var(--pale-blue-purple)]">HR Manager</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-[var(--secondary-lavender)]">
            Email: john.doe@company.com
          </p>
          <p className="text-sm text-[var(--secondary-lavender)]">
            Joined: Feb 2023
          </p>
        </div>
        <button className="w-full bg-[var(--primary-blue)] text-white py-2 rounded-lg hover-advanced text-sm font-medium">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
