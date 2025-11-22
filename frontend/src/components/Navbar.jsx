// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  const renderNavLinks = () => {
    if (!user) {
      return (
        <nav className="hidden md:flex gap-6 text-gray-600">
          <Link to="/" className="hover:text-gray-900">Home</Link>
        </nav>
      );
    }

    if (user.role === "Teacher") {
      return null;
    }

    // Student links
    return (
      <nav className="hidden md:flex gap-6 text-gray-600">
        <Link to="/student/dashboard" className="hover:text-gray-900">Assignments</Link>
        <Link to="/student/submissions" className="hover:text-gray-900">Submissions</Link>
      </nav>
    );
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold">AMS</div>
          {renderNavLinks()}
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{user.name?.charAt(0) || "U"}</div>
              <span className="text-gray-700 hidden md:inline">{user.name}</span>
            </div>
          )}
          <button onClick={handleLogout} className="px-4 py-2 bg-blue-600 text-white rounded">Logout</button>
        </div>
      </div>
    </header>
  );
}
