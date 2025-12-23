// src/pages/StudentFeedback.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissions } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import { motion } from "framer-motion";

export default function StudentFeedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = user;
    if (!u) {
      navigate("/");
      return;
    }
    if (u.role !== "Student") {
      navigate("/student/dashboard");
      return;
    }

    getSubmissions()
      .then((list) => {
        const found = (list || []).find((s) => (s._id || s.id) === id);
        if (found) setSubmission(found);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, navigate, user]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const API_ORIGIN = import.meta.env.VITE_API_URL;
  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http")) return fileUrl;
    return `${API_ORIGIN}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
  };
  const isPDF = (urlOrFile) => {
    if (!urlOrFile) return false;
    if (typeof urlOrFile === 'string') return urlOrFile.toLowerCase().endsWith('.pdf');
    if (urlOrFile instanceof File) return urlOrFile.type === 'application/pdf';
    return false;
  };

  if (loading) return (
    <StudentLayout>
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c5f7a]"></div>
      </div>
    </StudentLayout>
  );

  if (!submission) {
    return (
      <StudentLayout>
        <div className="p-8 flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-500 mb-6">The submission you are looking for does not exist or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate("/student/submissions")}
            className="px-6 py-2 bg-[#2c5f7a] text-white rounded-lg hover:bg-[#1a3a52] transition-colors"
          >
            Back to Submissions
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button 
            onClick={() => navigate("/student/submissions")}
            className="flex items-center gap-2 text-gray-500 hover:text-[#2c5f7a] transition-colors mb-4 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Submissions
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#f5f7f9] text-[#1a3a52] rounded-full text-xs font-bold uppercase tracking-wide border border-[#b8c5d0]">
              Assignment Feedback
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{submission.assignmentTitle || submission.assignment?.title}</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Document Viewer */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <div className="bg-white rounded-2xl border border-gray-200 p-1 shadow-sm overflow-hidden h-[600px] lg:h-[800px]">
              {submission.fileUrl && isPDF(submission.fileUrl) ? (
                <iframe src={getFileUrl(submission.fileUrl)} title="Document Preview" className="w-full h-full border-none rounded-xl" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Preview Not Available</h4>
                  <p className="text-gray-500 mb-6 max-w-md text-center">The file format cannot be previewed directly in the browser. Please download the file to view it.</p>
                  {submission.fileUrl && (
                    <a 
                      href={getFileUrl(submission.fileUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-6 py-3 bg-[#2c5f7a] text-white rounded-xl font-medium hover:bg-[#1a3a52] transition-colors shadow-lg shadow-lg flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download File
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar Info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Student Info Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Submission Details</h3>
              <div className="flex items-center gap-4 mb-6">
                {(submission.student?.avatar || submission.studentAvatar || user.avatar) ? (
                  <img 
                    src={getFileUrl(submission.student?.avatar || submission.studentAvatar || user.avatar)} 
                    alt="avatar" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" 
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4a7a94] to-[#4a7a94] flex items-center justify-center text-white font-bold text-xl shadow-md">
                    {(submission.studentName || submission.student?.name || user.name || "S").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900 text-lg">{submission.studentName || submission.student?.name || user.name}</div>
                  <div className="text-sm text-gray-500 font-medium">Student</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500 font-medium">Submitted on</span>
                  <span className="text-sm font-bold text-gray-900">{formatDate(submission.submittedAt)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-500 font-medium">Status</span>
                  <span className={`text-sm font-bold px-2 py-1 rounded-lg ${submission.marks != null ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {submission.marks != null ? 'Graded' : 'Pending Review'}
                  </span>
                </div>
              </div>
            </div>

            {/* Grade & Feedback Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#4a7a94]/10 to-[#8ba3b5]/10 rounded-bl-full -mr-10 -mt-10"></div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-6 relative z-10">Grade & Feedback</h3>
              
              <div className="mb-8 text-center relative z-10">
                <div className="inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-4 border-[#b8c5d0] bg-white shadow-sm mb-2">
                  {submission.marks != null ? (
                    <>
                      <span className="text-4xl font-bold text-[#2c5f7a]">{submission.marks}</span>
                      <span className="text-xs text-gray-400 font-medium uppercase mt-1">out of {submission.assignmentMaxMarks || submission.assignment?.maxMarks || 100}</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-medium">--</span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-500">Final Score</p>
              </div>

              <div className="relative z-10">
                <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4a7a94]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Instructor Feedback
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 min-h-[120px] text-gray-700 leading-relaxed text-sm">
                  {submission.feedback ? (
                    submission.feedback
                  ) : (
                    <span className="text-gray-400 italic">No feedback provided yet.</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </StudentLayout>
  );
}
