// src/components/EmptyState.jsx
import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ message = "Nothing here yet.", icon }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm flex flex-col items-center justify-center"
    >
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        {icon || (
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">It's quiet here...</h3>
      <p className="text-gray-500 max-w-sm mx-auto">{message}</p>
    </motion.div>
  );
}
