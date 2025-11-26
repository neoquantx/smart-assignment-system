import React, { useEffect, useState } from "react";
import StudentLayout from "../components/StudentLayout";
import ProfileCard from "../components/ProfileCard";
import ProfileEditModal from "../components/ProfileEditModal";
import { getAssignments, getSubmissions, updateProfile, getProfile } from "../services/api";
import { AnimatePresence } from "framer-motion";

export default function StudentProfile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(stored);
  const [stats, setStats] = useState({ total: 0, done: 0, left: 0, missed: 0 });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignments, submissions, profile] = await Promise.all([
          getAssignments(), 
          getSubmissions(),
          getProfile()
        ]);

        // assignments: array of all assignments
        // submissions: array of student's submissions
        const total = Array.isArray(assignments) ? assignments.length : 0;
        const done = Array.isArray(submissions) ? submissions.length : 0;
        
        // Calculate missed assignments (deadline passed and not submitted)
        const now = new Date();
        const missed = Array.isArray(assignments) ? assignments.filter(assignment => {
          const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
          const hasSubmitted = submissions.some(s => 
            String(s.assignment?._id || s.assignment) === String(assignment._id || assignment.id)
          );
          return deadline && now > deadline && !hasSubmitted;
        }).length : 0;
        
        // Left = total - done - missed (only active assignments not yet submitted)
        const left = Math.max(0, total - done - missed);
        
        setStats({ total, done, left, missed });
        
        if (profile) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }
      } catch (err) {
        console.warn("Failed to load data", err);
      }
    }

    loadData();
  }, []);

  async function handleEditSave(formDataRaw) {
    try {
      const formData = new FormData();
      formData.append("name", formDataRaw.name);
      formData.append("email", formDataRaw.email);
      formData.append("bio", formDataRaw.bio);
      formData.append("department", formDataRaw.department);
      formData.append("institution", formDataRaw.institution);
      formData.append("courses", formDataRaw.courses);
      if (formDataRaw.avatarFile) {
        formData.append("avatar", formDataRaw.avatarFile);
      }

      const updated = await updateProfile(formData);
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setEditing(false);
      // notify other components (Navbar, sidebar) to refresh their user state
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile");
    }
  }

  return (
    <StudentLayout>
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
            <p className="text-gray-500 mt-1">Manage your personal information and settings</p>
          </div>
          <a 
            href="mailto:support@example.com" 
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#2c5f7a] hover:text-[#1a3a52] bg-[#f5f7f9] px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Contact Support
          </a>
        </div>

        <ProfileCard user={user} onEdit={() => setEditing(true)} stats={stats} />

        <AnimatePresence>
          {editing && (
            <ProfileEditModal user={user} onSave={handleEditSave} onClose={() => setEditing(false)} />
          )}
        </AnimatePresence>
      </div>
    </StudentLayout>
  );
}
