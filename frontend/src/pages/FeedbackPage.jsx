// src/pages/FeedbackPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissions, postFeedback } from "../services/api";

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading submission...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (kept compact) */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">EduSync</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button onClick={() => navigate('/teacher/dashboard')} className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition">Dashboard</button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 w-full transition">Assignments</button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition">Students</button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">DR</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Dr. Evelyn Reed</p>
              <p className="text-xs text-gray-500">Teacher</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 text-sm text-gray-500">Advanced Biology / Lab Report 3 / <span className="text-gray-900 font-medium">{submission.studentName || submission.student?.name || 'John Doe'}</span></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Feedback for Lab Report 3</h1>

          <div className="grid grid-cols-12 gap-6">
            {/* Left - Document viewer (span 8) */}
            <div className="col-span-8">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Student Submission</h3>
                  <div className="flex items-center gap-2 text-gray-500">
                    <button className="p-2 rounded hover:bg-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></button>
                    <button className="p-2 rounded hover:bg-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618V17a2 2 0 01-2 2h-8"/></svg></button>
                    <button className="p-2 rounded hover:bg-gray-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg></button>
                  </div>
                </div>

                <div className="p-8">
                    {submission.fileUrl && isPDF(submission.fileUrl) ? (
                      <iframe src={getFileUrl(submission.fileUrl)} title="Document Preview" className="w-full h-[560px] border-none rounded-lg" />
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg py-20 text-center bg-gray-50">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        <h4 className="text-lg font-semibold text-gray-700">Document viewer placeholder</h4>
                        <p className="text-sm text-gray-500 mt-2">Student's submitted file (PDF, DOCX) would be displayed here.</p>
                        {submission.fileUrl && (
                          <a href={getFileUrl(submission.fileUrl)} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">Open File in New Tab</a>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Right - student info + feedback card (span 4) */}
            <div className="col-span-4 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
                <img src={submission.studentAvatar || 'https://i.pravatar.cc/40'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-gray-900">{submission.studentName || submission.student?.name || 'John Doe'}</div>
                  <div className="text-sm text-gray-500">Submitted: {formatDate(submission.submittedAt)}</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-2">Marks</label>
                <input id="marks" type="number" min="0" max="100" value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="Enter marks (e.g., 85)" className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" />

                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">Feedback Comment</label>
                <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={8} placeholder="Provide detailed feedback here. Focus on strengths and areas for improvement..." className="w-full px-3 py-2 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />

                <div className="flex items-center justify-between">
                  <button onClick={() => navigate('/teacher/dashboard')} className="text-gray-600 hover:text-gray-800">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
