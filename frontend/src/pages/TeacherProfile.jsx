import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import ProfileEditModal from "../components/ProfileEditModal";
import { getAssignments, getSubmissions } from "../services/api";

export default function TeacherProfile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(stored);
  const [stats, setStats] = useState({ done: 0, left: 0 });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [assignments, submissions] = await Promise.all([getAssignments(), getSubmissions()]);

        // For teacher: assignments they created and pending evaluations
        const allAssignments = Array.isArray(assignments) ? assignments : [];
        const myAssignments = allAssignments.filter((a) => String(a.creatorId) === String(stored?.id) || String(a.creator_id) === String(stored?.id));
        const totalCreated = myAssignments.length;

        const myAssignmentIds = new Set(myAssignments.map((a) => String(a._id || a.id)));

        const allSubmissions = Array.isArray(submissions) ? submissions : [];
        // Only count pending submissions for this teacher's assignments
        const pending = allSubmissions.filter((s) => {
          const assignmentId = String(s.assignment?._id || s.assignment || s.assignmentId || "");
          const belongsToMe = myAssignmentIds.has(assignmentId);
          const notGraded = !(s.grade != null || s.marks != null || s.status === "graded");
          return belongsToMe && notGraded;
        });

        setStats({ done: totalCreated, left: pending.length });
      } catch (err) {
        console.warn("Failed to load teacher stats", err);
      }
    }

    loadStats();
  }, [stored?.id]);

  function handleEditSave(updated) {
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold mb-6">Teacher Profile</h2>
          <div className="text-sm text-gray-500">Need help? <a href="mailto:support@example.com" className="underline">Contact Support</a></div>
        </div>

        <ProfileCard user={user} onEdit={() => setEditing(true)} stats={stats} />

        {editing && (
          <ProfileEditModal user={user} onSave={handleEditSave} onClose={() => setEditing(false)} />
        )}
      </main>
    </div>
  );
}
