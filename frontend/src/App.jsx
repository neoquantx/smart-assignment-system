// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loading from "./components/Loading";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard.jsx"));
const StudentSubmissions = lazy(() => import("./pages/StudentSubmissions.jsx"));
const AssignmentSubmission = lazy(() => import("./pages/AssignmentSubmission.jsx"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard.jsx"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/submissions" element={<StudentSubmissions />} />
          <Route path="/student/submit/:id" element={<AssignmentSubmission />} />
          <Route path="/student/profile" element={<div className="p-8">Profile - Coming Soon</div>} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/feedback/:id" element={<FeedbackPage />} />
          <Route path="/teacher/analytics" element={<Analytics />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
