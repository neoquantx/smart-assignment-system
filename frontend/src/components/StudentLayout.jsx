// src/components/StudentLayout.jsx
import React, { useState, useEffect } from "react";
import { getProfile } from "../services/api";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const profile = await getProfile();
        if (profile) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (err) {
        // fallback to localStorage if API fails
        setUser(JSON.parse(localStorage.getItem("user") || "{}"));
      }
    };

    // fetch immediately and on updates
    refreshUser();
    window.addEventListener("userUpdated", refreshUser);
    return () => window.removeEventListener("userUpdated", refreshUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser({});
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    const API_BASE = import.meta.env.VITE_API_URL;
    return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2c5f7a] to-[#4a7a94] rounded-xl shadow-lg shadow-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">SmartAssign</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-6 border-b border-gray-200/50 bg-gray-50/50">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img src={getAvatarUrl(user.avatar)} alt="avatar" className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md" />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-[#4a7a94] to-[#8ba3b5] rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
              {user.name?.charAt(0).toUpperCase() || "S"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name || "Student"}</p>
            <p className="text-xs text-gray-500 truncate">{user.email || "student@example.com"}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="px-2 py-1 text-[10px] font-medium bg-[#e8eef2] text-[#1a3a52] rounded-full uppercase tracking-wider">Student</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link
          to="/student/dashboard"
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/student/dashboard")
              ? "bg-[#2c5f7a] text-white shadow-lg shadow-lg"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="font-medium">Assignments</span>
        </Link>

        <Link
          to="/student/submissions"
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/student/submissions")
              ? "bg-[#2c5f7a] text-white shadow-lg shadow-lg"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">My Submissions</span>
        </Link>

        <Link
          to="/student/profile"
          onClick={() => setIsSidebarOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            isActive("/student/profile")
              ? "bg-[#2c5f7a] text-white shadow-lg shadow-lg"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="font-medium">Profile</span>
        </Link>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full group"
        >
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium">Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 bg-white border-r border-gray-200/50 shadow-sm z-30">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#2c5f7a] to-[#4a7a94] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900">SmartAssign</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
