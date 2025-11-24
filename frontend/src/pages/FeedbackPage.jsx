// src/pages/FeedbackPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissions, postFeedback } from "../services/api";
import { motion } from "framer-motion";

export default function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [submission, setSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    if (user.role !== "Teacher") {
      navigate("/student/dashboard");
      return;
    }

    // Load submission details
    getSubmissions()
      .then((list) => {
        const found = (list || []).find((s) => (s._id || s.id) === id);
        if (found) {
          setSubmission(found);
          setMarks(found.marks?.toString() || "");
          setFeedback(found.feedback || "");
        } else {
          setSubmission(null);
        }
      })
      .catch(() => setSubmission(null));
  }, [id, navigate, user]);

  const handleSave = async () => {
    if (!marks || marks === "") {
      alert("Please enter marks before saving");
      return;
    }

    const max = submission && (submission.assignmentMaxMarks || submission.assignment?.maxMarks) ? (submission.assignmentMaxMarks || submission.assignment?.maxMarks) : 100;
    if (Number(marks) < 0 || Number(marks) > Number(max)) {
      alert(`Marks must be between 0 and ${max}`);
      return;
    }

    setSaving(true);
    try {
      await postFeedback({
        submissionId: id,
        marks: Number(marks),
        feedback: feedback
      });
      alert("Feedback saved successfully!");
      navigate("/teacher/dashboard");
    } catch (err) {
      alert(err.message || "Failed to save feedback");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const API_ORIGIN = (import.meta.env.VITE_API_BASE || "http://localhost:8000").replace(/\/api$/, "");
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http")) return fileUrl;
    return `${API_ORIGIN}${fileUrl}`;
  };
  const isPDF = (urlOrFile) => {
    if (!urlOrFile) return false;
    if (typeof urlOrFile === 'string') return urlOrFile.toLowerCase().endsWith('.pdf');
    if (urlOrFile instanceof File) return urlOrFile.type === 'application/pdf';
    return false;
  };

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (kept compact) */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">AMS</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 w-full transition-all font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-600 w-full transition-all font-medium shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Grading
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
              {user.name ? user.name.charAt(0).toUpperCase() : "T"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">Teacher</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button 
              onClick={() => navigate("/teacher/dashboard")}
              className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-4 group"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <span>{submission.assignmentTitle || submission.assignment?.title}</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">{submission.studentName || submission.student?.name || 'Student'}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Grading Submission</h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left - Document viewer (span 8) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8"
            >
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-[800px] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Submission Preview
                  </h3>
                  {submission.fileUrl && (
                    <a 
                      href={getFileUrl(submission.fileUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      Open in new tab
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
                    {submission.fileUrl && isPDF(submission.fileUrl) ? (
                      <iframe src={getFileUrl(submission.fileUrl)} title="Document Preview" className="w-full h-full border-none rounded-xl shadow-sm bg-white" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">Preview Not Available</h4>
                        <p className="text-gray-500 mb-6 max-w-md text-center">The file format cannot be previewed directly. Please download to view.</p>
                        {submission.fileUrl && (
                          <a 
                            href={getFileUrl(submission.fileUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                          >
                            Download File
                          </a>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </motion.div>

            {/* Right - student info + feedback card (span 4) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 space-y-6"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Student Details</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={submission.studentAvatar || 'https://i.pravatar.cc/150?img=12'} 
                    alt="avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" 
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{submission.studentName || submission.student?.name || 'John Doe'}</div>
                    <div className="text-sm text-gray-500">Submitted: {formatDate(submission.submittedAt)}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Evaluation</h3>
                
                <div className="mb-6">
                  <label htmlFor="marks" className="block text-sm font-bold text-gray-700 mb-2">Marks Awarded</label>
                  <div className="relative">
                    <input 
                      id="marks" 
                      type="number" 
                      min="0" 
                      max={submission.assignmentMaxMarks || submission.assignment?.maxMarks || 100} 
                      value={marks} 
                      onChange={(e) => setMarks(e.target.value)} 
                      placeholder="0" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold" 
                    />
                    <div className="absolute right-4 top-3.5 text-gray-400 font-medium">
                      / {submission.assignmentMaxMarks || submission.assignment?.maxMarks || 100}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label htmlFor="feedback" className="block text-sm font-bold text-gray-700 mb-2">Feedback & Comments</label>
                  <textarea 
                    id="feedback" 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    rows={8} 
                    placeholder="Provide detailed feedback here. Focus on strengths and areas for improvement..." 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => navigate('/teacher/dashboard')} 
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:shadow-none transition-all"
                  >
                    {saving ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
