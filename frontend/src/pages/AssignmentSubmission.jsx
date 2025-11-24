// src/pages/AssignmentSubmission.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSubmission, getAssignment } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import { motion, AnimatePresence } from "framer-motion";

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
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    
    getAssignment(id)
      .then((res) => {
        setAssignment(res);
        if (res && res.deadline) {
          const now = new Date();
          const deadline = new Date(res.deadline);
          if (now > deadline) {
            setDeadlinePassed(true);
          }
        }
      })
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

    if (deadlinePassed) {
      alert("The deadline for this assignment has passed. You can no longer submit.");
      return;
    }
    
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto p-4 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button 
            onClick={() => navigate("/student/dashboard")}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>

          {/* Assignment Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {assignment.title}
              </h1>
              {deadlinePassed ? (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold uppercase tracking-wide self-start">
                  Deadline Passed
                </span>
              ) : (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold uppercase tracking-wide self-start">
                  Active Assignment
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-600 bg-gray-100 w-fit px-4 py-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <span className="font-medium">Due: {formatDate(assignment.deadline)}</span>
            </div>
          </div>

          {/* Instructions Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 mb-8 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Instructions
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {assignment.description || "Please submit your work in either PDF or DOCX format. The maximum file size is 25MB. Ensure your essay addresses all prompts outlined in the assignment brief, includes proper citations, and is formatted according to the style guide provided in class. Late submissions will be penalized."}
            </div>
          </motion.div>

          {/* Submit Your Work Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Work</h2>

            <form onSubmit={handleSubmit}>
              {/* Drag & Drop Area */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`border-3 border-dashed rounded-2xl p-12 mb-8 text-center transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                    : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !deadlinePassed && fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center pointer-events-none">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${dragActive ? "bg-blue-100" : "bg-gray-100"}`}>
                    <svg
                      className={`w-10 h-10 ${
                        dragActive ? "text-blue-600" : "text-gray-400"
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
                  </div>
                  <p className="text-xl font-bold text-gray-900 mb-2">
                    {dragActive ? "Drop it like it's hot!" : "Drag & drop your file here"}
                  </p>
                  <p className="text-gray-500 mb-4">or click to browse</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
                    PDF, DOCX up to 25MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    disabled={deadlinePassed}
                  />
                </div>
              </motion.div>

              {/* File Preview */}
              <AnimatePresence>
                {file && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{file.name}</p>
                          <p className="text-sm text-gray-500 font-medium">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                    
                    {filePreviewUrl && (
                      <div className="w-full mt-4 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                        <iframe src={filePreviewUrl} title="Preview" className="w-full h-[500px] border-none" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Success Message */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 mb-6"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-green-800 font-bold">File selected successfully! Ready to submit.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={deadlinePassed || !file || uploading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-10 py-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
                >
                  {deadlinePassed ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Deadline Passed
                    </>
                  ) : uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Assignment
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </StudentLayout>
  );
}
