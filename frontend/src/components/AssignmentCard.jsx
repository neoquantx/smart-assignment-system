import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function AssignmentCard({ id, title, desc, date, subject = "General", hasSubmitted = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col"
    >
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-[#f5f7f9] rounded-lg group-hover:bg-[#e8eef2] transition-colors">
            <svg className="w-6 h-6 text-[#2c5f7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {subject}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#2c5f7a] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
          {desc || "No description provided."}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Due: {formatDate(date)}</span>
        </div>

        {hasSubmitted ? (
          <Link
            to="/student/submissions"
            className="block w-full bg-green-50 text-green-700 border border-green-200 text-center font-medium py-2.5 px-4 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            View Submission
          </Link>
        ) : (
          <Link
            to={`/student/submit/${id}`}
            className="block w-full bg-gradient-to-r from-[#2c5f7a] to-[#4a7a94] text-white text-center font-medium py-2.5 px-4 rounded-lg hover:shadow-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>View / Submit</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
