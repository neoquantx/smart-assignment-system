// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentSubmissions = lazy(() => import("./pages/StudentSubmissions"));
const AssignmentSubmission = lazy(() => import("./pages/AssignmentSubmission"));

const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const Analytics = lazy(() => import("./pages/Analytics"));

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4"> {/* simple header */}
          <div className="text-lg font-semibold">AMS</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="py-20 text-center">Loading…</div>}>
          <Routes>
            {/* Auth */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Pages */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/submissions" element={<StudentSubmissions />} />
            <Route path="/student/assignment/:id" element={<AssignmentSubmission />} />

            {/* Teacher Pages */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/feedback/:id" element={<FeedbackPage />} />
            <Route path="/teacher/analytics" element={<Analytics />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}
