import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ icon, label, value, color = "blue" }) {
  const colorClasses = {
    blue: "bg-[#f5f7f9] text-[#2c5f7a]",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-[#e8eef2] text-[#2c5f7a]",
    red: "bg-red-50 text-red-600",
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClasses[color] || colorClasses.blue}`}>
          {icon || (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}
