import React from "react";
import { motion } from "framer-motion";

export default function ProfileCard({ user, onEdit, stats = {} }) {
  if (!user) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  const {
    name,
    email,
    role,
    department,
    institution,
    courses = [],
    bio,
    avatar,
  } = user;

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("data:") || path.startsWith("http")) return path;
    return `http://localhost:8000${path}`;
  };

  const avatarEl = avatar ? (
    <img 
      src={getAvatarUrl(avatar)} 
      alt="avatar" 
      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
    />
  ) : (
    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4a7a94] to-[#4a7a94] flex items-center justify-center text-4xl font-bold text-white border-4 border-white shadow-lg">
      {name ? name.charAt(0).toUpperCase() : "U"}
    </div>
  );

  const monthlyAssignments = Array.isArray(stats.monthlyAssignments)
    ? stats.monthlyAssignments
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 overflow-hidden border border-gray-100"
    >
      {/* Cover Image Background */}
      <div className="h-32 bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-4 right-4 flex gap-2">
           <button 
            onClick={onEdit}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="relative -mt-16 mb-6 flex justify-between items-end">
          {avatarEl}
          <div className="mb-1 hidden sm:block">
             <span className="px-3 py-1 bg-[#f5f7f9] text-[#1a3a52] rounded-full text-xs font-bold uppercase tracking-wide border border-[#b8c5d0]">
              {role || "Student"}
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{name || "Unknown User"}</h1>
            <p className="text-gray-500 font-medium mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {email || "no-email@example.com"}
            </p>

            {bio && (
              <p className="text-gray-600 leading-relaxed mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                {bio}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {department && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-[#e8eef2] flex items-center justify-center text-[#2c5f7a]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Department</p>
                    <p className="font-semibold">{department}</p>
                  </div>
                </div>
              )}
              
              {institution && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 rounded-lg bg-[#e8eef2] flex items-center justify-center text-[#4a7a94]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Institution</p>
                    <p className="font-semibold">{institution}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Column */}
          <div className="w-full md:w-72 flex flex-col gap-4">
            {monthlyAssignments ? (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#2c5f7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Activity
                </h3>
                <div className="space-y-3">
                  {monthlyAssignments.map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                      <span className="text-sm font-medium text-gray-600">{item.label}</span>
                      <span className="text-lg font-bold text-[#2c5f7a]">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-[#e8eef2] p-4 rounded-2xl border border-[#b8c5d0]">
                  <p className="text-[#2c5f7a] text-sm font-medium mb-1">Total Assignments</p>
                  <p className="text-3xl font-bold text-[#1a3a52]">{stats.total ?? 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                  <p className="text-green-600 text-sm font-medium mb-1">Assignments Done</p>
                  <p className="text-3xl font-bold text-green-700">{stats.done ?? 0}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <p className="text-orange-600 text-sm font-medium mb-1">Assignments Left</p>
                  <p className="text-3xl font-bold text-orange-700">{stats.left ?? 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                  <p className="text-red-600 text-sm font-medium mb-1">Assignments Missed</p>
                  <p className="text-3xl font-bold text-red-700">{stats.missed ?? 0}</p>
                </div>
                <div className="bg-[#e8eef2] p-4 rounded-2xl border border-[#b8c5d0]">
                  <p className="text-[#2c5f7a] text-sm font-medium mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-[#1a3a52]">{(courses && courses.length) || 0}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {Array.isArray(courses) && courses.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#2c5f7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Enrolled Courses
            </h4>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Subject Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Subject Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {courses.map((c, i) => {
                    const courseStr = c.name || c;
                    const [name, code] = courseStr.includes(':') 
                      ? courseStr.split(':').map(s => s.trim()) 
                      : [courseStr, ''];
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono">{code || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
