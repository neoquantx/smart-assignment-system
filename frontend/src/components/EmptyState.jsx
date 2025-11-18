// src/components/EmptyState.jsx
import React from "react";
export default function EmptyState({ message = "Nothing here yet." }){
  return <div className="bg-white p-6 rounded shadow text-gray-600">{message}</div>;
}
