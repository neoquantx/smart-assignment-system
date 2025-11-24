// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loading from "./components/Loading";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard.jsx"));
const StudentSubmissions = lazy(() => import("./pages/StudentSubmissions.jsx"));
const AssignmentSubmission = lazy(() => import("./pages/AssignmentSubmission.jsx"));
const StudentFeedback = lazy(() => import("./pages/StudentFeedback.jsx"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard.jsx"));
const StudentProfile = lazy(() => import("./pages/StudentProfile.jsx"));
const TeacherProfile = lazy(() => import("./pages/TeacherProfile.jsx"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/submissions" element={<StudentSubmissions />} />
          <Route path="/student/submit/:id" element={<AssignmentSubmission />} />
          <Route path="/student/feedback/:id" element={<StudentFeedback />} />

          <Route path="/student/profile" element={<StudentProfile />} />

          {/* Teacher Routes */}
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/profile" element={<Navigate to="/teacher/dashboard?tab=profile" replace />} />
          <Route path="/teacher/feedback/:id" element={<FeedbackPage />} />
          <Route path="/teacher/analytics" element={<Navigate to="/teacher/dashboard?tab=analytics" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
