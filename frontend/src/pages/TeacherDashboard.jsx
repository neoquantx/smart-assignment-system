// src/pages/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { getAssignments, getSubmissions, createAssignment, postFeedback, getUsers } from "../services/api";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Chat from "../components/Chat";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    deadline: "",
    maxMarks: 100
  });

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [chatWithUser, setChatWithUser] = useState(null);

  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "Teacher") {
      navigate("/student/dashboard");
      return;
    }
    // pick tab from query param if present
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);

    loadData();
  }, []); // ✅ FIXED: Empty dependency array - only run once on mount

  const loadData = () => {
    setLoading(true);
    Promise.all([getAssignments(), getSubmissions(), getUsers("Student")])
      .then(([a, s, st]) => {
        setAssignments(a || []);
        setSubmissions(s || []);
        setStudents(st || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleSetTab = (t) => {
    setActiveTab(t);
    navigate(`?tab=${t}`, { replace: true });
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
        deadline: newAssignment.deadline,
        maxMarks: Number(newAssignment.maxMarks) || 100
      });
      
      alert("Assignment created successfully!");
      setShowCreateModal(false);
      setNewAssignment({ title: "", description: "", deadline: "", maxMarks: 100 });
      loadData();
    } catch (err) {
      alert(err.message || "Failed to create assignment");
    } finally {
      setCreating(false);
    }
  };

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marks?.toString() || "");
    setFeedback(submission.feedback || "");
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    if (!marks || marks === "") {
      alert("Please enter marks before saving");
      return;
    }

    const max = selectedSubmission && (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) ? (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) : 100;
    if (Number(marks) < 0 || Number(marks) > Number(max)) {
      alert(`Marks must be between 0 and ${max}`);
      return;
    }

    setSaving(true);
    try {
      await postFeedback({
        submissionId: selectedSubmission._id || selectedSubmission.id,
        marks: Number(marks),
        feedback: feedback
      });
      alert("Feedback saved successfully!");
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setMarks("");
      setFeedback("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to save feedback");
    } finally {
      setSaving(false);
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
      <Navbar />

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
            onClick={() => handleSetTab("assignments")}
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
            onClick={() => handleSetTab("submissions")}
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
          <button
            onClick={() => handleSetTab("feedback")}
            className={`pb-4 font-medium transition relative ${
              activeTab === "feedback"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Feedback
            {activeTab === "feedback" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            )}
          </button>
          <button
            onClick={() => navigate('/teacher/profile')}
            className={`pb-4 font-medium transition relative ${
              activeTab === "profile"
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Profile
            {activeTab === "profile" && (
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
        ) : activeTab === "submissions" ? (
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
                          <button
                            onClick={() => handleGrade(sub)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            {sub.marks != null ? "View/Edit" : "Grade"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : activeTab === "feedback" ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Graded Submissions</h2>
            {submissions.filter(sub => sub.marks != null).length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No graded submissions yet</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submissions.filter(sub => sub.marks != null).map((sub) => (
                      <tr key={sub._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{sub.studentName || sub.student?.name || "Student"}</td>
                        <td className="px-6 py-4 text-sm">{sub.assignmentTitle || sub.assignment?.title || "Assignment"}</td>
                        <td className="px-6 py-4 text-sm">{formatDate(sub.submittedAt)}</td>
                        <td className="px-6 py-4 text-sm font-medium">{sub.marks}/{sub.assignmentMaxMarks || sub.assignment?.maxMarks || 100}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleGrade(sub)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View/Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Chat Section */}
      <div className="max-w-7xl mx-auto p-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat with Students</h2>
        <div className="flex gap-4">
          <div className="w-1/3">
            <h3 className="text-lg font-semibold mb-2">Select a Student</h3>
            <div className="space-y-2">
              {students.map((student) => {
                const sid = student._id || student.id;
                const selectedId = chatWithUser?._id || chatWithUser?.id;
                return (
                  <button
                    key={sid}
                    onClick={() => setChatWithUser(student)}
                    className={`w-full text-left p-3 rounded-lg border ${
                      selectedId === sid
                        ? "bg-blue-100 border-blue-300"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {student.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="w-2/3">
            <Chat currentUser={user} chatWithUser={chatWithUser} />
          </div>
        </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                <input
                  type="number"
                  min={1}
                  value={newAssignment.maxMarks}
                  onChange={(e) => setNewAssignment({...newAssignment, maxMarks: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Total marks for this assignment (e.g., 30)"
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

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedSubmission.marks != null ? "Edit" : "Grade"} Submission
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <p className="text-gray-900">{selectedSubmission.studentName || selectedSubmission.student?.name || "Student"}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
                <p className="text-gray-900">{selectedSubmission.assignmentTitle || selectedSubmission.assignment?.title || "Assignment"}</p>
              </div>

              <div>
                <label htmlFor="modal-marks" className="block text-sm font-medium text-gray-700 mb-2">Marks {selectedSubmission && (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) ? `(out of ${selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks})` : ""}</label>
                <input
                  id="modal-marks"
                  type="number"
                  min="0"
                  max={selectedSubmission && (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) ? (selectedSubmission.assignmentMaxMarks || selectedSubmission.assignment?.maxMarks) : 100}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Enter marks"
                />
              </div>
              
              <div>
                <label htmlFor="modal-feedback" className="block text-sm font-medium text-gray-700 mb-2">Feedback Comment</label>
                <textarea
                  id="modal-feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Provide detailed feedback here..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGradeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveGrade}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
