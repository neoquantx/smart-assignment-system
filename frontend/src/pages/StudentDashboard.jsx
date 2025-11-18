// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAssignments } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "Student") {
      navigate("/");
      return;
    }

    setLoading(true);
    getAssignments()
      .then((res) => setAssignments(res || []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, [navigate]);

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
    <StudentLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Assignments</h1>
          <p className="text-gray-600 mt-2">
            Here are the assignments currently available for you to complete.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading />
          </div>
        ) : assignments.length === 0 ? (
          <EmptyState message="No assignments available at the moment." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <div
                key={assignment._id || assignment.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {assignment.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {assignment.description || "No description provided."}
                </p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Due: {formatDate(assignment.deadline)}</span>
                </div>

                <Link
                  to={`/student/submit/${assignment._id || assignment.id}`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-lg transition"
                >
                  View / Submit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
