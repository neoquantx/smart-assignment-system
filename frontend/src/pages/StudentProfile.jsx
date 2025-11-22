import React, { useEffect, useState } from "react";
import StudentLayout from "../components/StudentLayout";
import ProfileCard from "../components/ProfileCard";
import ProfileEditModal from "../components/ProfileEditModal";
import { getAssignments, getSubmissions } from "../services/api";

export default function StudentProfile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(stored);
  const [stats, setStats] = useState({ done: 0, left: 0 });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [assignments, submissions] = await Promise.all([getAssignments(), getSubmissions()]);

        // assignments: array of assignments available
        // submissions: array of student's submissions
        const total = Array.isArray(assignments) ? assignments.length : 0;
        const done = Array.isArray(submissions) ? submissions.length : 0;
        const left = Math.max(0, total - done);
        setStats({ done, left });
      } catch (err) {
        console.warn("Failed to load stats", err);
      }
    }

    loadStats();
  }, []);

  function handleEditSave(updated) {
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  }

  return (
    <StudentLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
          <div className="text-sm text-gray-500">Need help? <a href="mailto:support@example.com" className="underline">Contact Support</a></div>
        </div>

        <ProfileCard user={user} onEdit={() => setEditing(true)} stats={stats} />

        {editing && (
          <ProfileEditModal user={user} onSave={handleEditSave} onClose={() => setEditing(false)} />
        )}
      </div>
    </StudentLayout>
  );
}
