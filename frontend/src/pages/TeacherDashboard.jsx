// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAssignments, getSubmissions, createAssignment } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "Teacher") {
      navigate("/student/dashboard");
      return;
    }

    loadData();
  }, []); // ✅ FIXED: Empty dependency array - only run once on mount

  const loadData = () => {
    setLoading(true);
    Promise.all([getAssignments(), getSubmissions()])
      .then(([a, s]) => {
        setAssignments(a || []);
        setSubmissions(s || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      await createAssignment({
        title: newAssignment.title,
        description: newAssignment.description,
        deadline: newAssignment.deadline
      });
      
      alert("Assignment created successfully!");
      setShowCreateModal(false);
      setNewAssignment({ title: "", description: "", deadline: "" });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const getAssignmentStatus = (assignment) => {
    if (!assignment.deadline) return { label: "Active", color: "green" };
    
    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const submissionCount = submissions.filter(s => 
      String(s.assignment?._id || s.assignment) === String(assignment._id)
    ).length;
    
    const relatedSubs = submissions.filter(s => 
      String(s.assignment?._id || s.assignment) === String(assignment._id)
    );
    const allGraded = relatedSubs.length > 0 && relatedSubs.every(s => s.marks != null);
    
    if (allGraded) return { label: "Graded", color: "blue" };
    if (now > deadline) return { label: "Active", color: "green" };
    if (now < deadline && submissionCount === 0) return { label: "Upcoming", color: "yellow" };
    return { label: "Active", color: "green" };
  };

  const getSubmissionCount = (assignmentId) => {
    const count = submissions.filter(s => 
      String(s.assignment?._id || s.assignment) === String(assignmentId)
    ).length;
    return count;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">AMS</span>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab("assignments")}
              className={activeTab === "assignments" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              Assignments
            </button>
            <button 
              onClick={() => setActiveTab("submissions")}
              className={activeTab === "submissions" ? "text-blue-600 font-medium" : "text-gray-600 hover:text-gray-900"}
            >
              Submissions
            </button>
            <button 
              onClick={() => setActiveTab("submissions")}
              className="text-gray-600 hover:text-gray-900"
            >
              Feedback
            </button>
            <Link to="/teacher/analytics" className="text-gray-600 hover:text-gray-900">
              Analytics
            </Link>
            <button onClick={handleLogout} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your assignments and review student submissions.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Create New Assignment
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-4 font-medium transition relative ${
              activeTab === "assignments"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Assignments
            {activeTab === "assignments" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("submissions")}
            className={`pb-4 font-medium transition relative ${
              activeTab === "submissions"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Submissions
            {activeTab === "submissions" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "assignments" ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assignments</h2>
            {assignments.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No assignments created yet. Create your first assignment!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => {
                  const status = getAssignmentStatus(assignment);
                  const submissionCount = getSubmissionCount(assignment._id);
                  const totalStudents = 30;
                  
                  return (
                    <div
                      key={assignment._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 flex-1">
                          {assignment.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status.color === "green"
                              ? "bg-green-100 text-green-800"
                              : status.color === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          <span>Due: {formatDate(assignment.deadline)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          <span>{submissionCount}/{totalStudents} Submissions</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Submissions</h2>
            {submissions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No submissions yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{sub.studentName || sub.student?.name || "Student"}</td>
                        <td className="px-6 py-4 text-sm">{sub.assignmentTitle || sub.assignment?.title || "Assignment"}</td>
                        <td className="px-6 py-4 text-sm">{formatDate(sub.submittedAt)}</td>
                        <td className="px-6 py-4">
                          {sub.marks != null ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Graded</span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/teacher/feedback/${sub._id || sub.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {sub.marks != null ? "View" : "Grade"}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Assignment title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Assignment description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
