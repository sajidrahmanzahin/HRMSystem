// src/components/ErrorBoundary.jsx
import React, { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen bg-dark text-white items-center justify-center">
          <div className="glass p-6 rounded-xl">
            <h1 className="text-xl font-bold text-[var(--pale-blue-purple)]">
              Something went wrong
            </h1>
            <p className="text-[var(--secondary-lavender)]">
              Please try refreshing the page or contact support.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover-advanced"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
