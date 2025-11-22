// src/pages/AssignmentSubmission.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSubmission, getAssignment } from "../services/api";
import StudentLayout from "../components/StudentLayout";

export default function AssignmentSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    getAssignment(id)
      .then((res) => setAssignment(res))
      .catch(() => setAssignment(null));
  }, [id, navigate, user]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      // Check file size (max 25MB)
      const maxSize = 25 * 1024 * 1024; // 25MB in bytes
      if (selectedFile.size > maxSize) {
        alert("File size must be less than 25MB");
        return;
      }

      // Check file type (PDF or DOCX)
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword"
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Please upload a PDF or DOCX file");
        return;
      }

      setFile(selectedFile);
      // create preview for PDF
      if (selectedFile && selectedFile.type === 'application/pdf') {
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        const url = URL.createObjectURL(selectedFile);
        setFilePreviewUrl(url);
      } else {
        setFilePreviewUrl(null);
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  useEffect(() => {
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [filePreviewUrl]);

  const removeFile = () => {
    setFile(null);
    setUploadSuccess(false);
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("assignmentId", id);
      fd.append("file", file);
      
      await createSubmission(fd);
      alert("Assignment submitted successfully!");
      navigate("/student/submissions");
    } catch (err) {
      alert(err.message || "Submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  if (!assignment) {
    return (
      <StudentLayout>
        <div className="p-8 flex justify-center items-center h-64">
          <p className="text-gray-500">Loading assignment...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Top Navbar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">AMS</span>
            </div>
            
            <nav className="flex items-center gap-8">
              <button onClick={() => navigate("/student/dashboard")} className="text-gray-600 hover:text-gray-900">
                Dashboard
              </button>
              <button className="text-blue-600 font-medium">Assignments</button>
              <button className="text-gray-600 hover:text-gray-900">Grades</button>
              <button className="text-gray-600 hover:text-gray-900">Calendar</button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto p-8">
          {/* Assignment Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {assignment.title}
            </h1>
            <p className="text-gray-600">
              Due: {formatDate(assignment.deadline)}
            </p>
          </div>

          {/* Instructions Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
            <p className="text-gray-700 leading-relaxed">
              {assignment.description || "Please submit your work in either PDF or DOCX format. The maximum file size is 25MB. Ensure your essay addresses all prompts outlined in the assignment brief, includes proper citations, and is formatted according to the style guide provided in class. Late submissions will be penalized."}
            </p>
          </div>

          {/* Submit Your Work Section */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Your Work</h2>

          <form onSubmit={handleSubmit}>
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 mb-6 text-center transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-white"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center">
                <svg
                  className={`w-16 h-16 mb-4 ${
                    dragActive ? "text-blue-500" : "text-blue-600"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Drag & drop your file here
                </p>
                <p className="text-gray-500 mb-4">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  click to browse
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
              </div>
            </div>

            {/* File Preview */}
            {file && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
                {filePreviewUrl && (
                  <div className="w-full mt-4">
                    <iframe src={filePreviewUrl} title="Preview" className="w-full h-[480px] border-none rounded-lg" />
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-6">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-green-800 font-medium">File uploaded successfully!</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!file || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? "Submitting..." : "Submit Assignment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}
