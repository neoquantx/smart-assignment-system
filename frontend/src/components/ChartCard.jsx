import React from "react";
import { motion } from "framer-motion";

export default function ChartCard({ children, title }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm w-full"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
      {children}
    </motion.div>
  );
}
