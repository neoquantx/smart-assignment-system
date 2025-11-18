// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="w-64 pr-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="text-lg font-semibold mb-4">AMS</div>
        <ul className="space-y-2 text-gray-700">
          <li><Link to="/teacher/dashboard" className="block py-2">Dashboard</Link></li>
          <li><Link to="/teacher/analytics" className="block py-2">Analytics</Link></li>
          <li><Link to="/teacher/feedback/1" className="block py-2">Feedback</Link></li>
        </ul>
      </div>
    </aside>
  );
}
