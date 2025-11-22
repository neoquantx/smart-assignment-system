// src/pages/StudentFeedback.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSubmissions } from "../services/api";
import StudentLayout from "../components/StudentLayout";

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

  if (loading) return (
    <StudentLayout>
      <div className="p-8">Loading...</div>
    </StudentLayout>
  );

  if (!submission) {
    return (
      <StudentLayout>
        <div className="p-8">Submission not found.</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-4 text-sm text-gray-500">{submission.assignmentTitle || submission.assignment?.title}</div>
        <h1 className="text-3xl font-bold mb-6">Feedback</h1>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <div>
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

          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
              <img src={submission.studentAvatar || 'https://i.pravatar.cc/40'} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="font-semibold text-gray-900">{submission.studentName || submission.student?.name}</div>
                <div className="text-sm text-gray-500">Submitted: {formatDate(submission.submittedAt)}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
              <div className="mb-3">
                <div className="text-sm text-gray-700 font-medium">Marks</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">{submission.marks != null ? `${submission.marks}/${submission.assignmentMaxMarks || submission.assignment?.maxMarks || 100}` : 'Not graded'}</div>
              </div>

              <div>
                <div className="text-sm text-gray-700 font-medium mb-2">Feedback Comment</div>
                <div className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3 min-h-[120px]">{submission.feedback || 'No feedback provided yet.'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
