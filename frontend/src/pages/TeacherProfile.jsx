import React, { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";
import ProfileEditModal from "../components/ProfileEditModal";
import { getAssignments, updateProfile, getProfile } from "../services/api";
import { AnimatePresence } from "framer-motion";

export default function TeacherProfile() {
  const stored = JSON.parse(localStorage.getItem("user") || "null");
  const [user, setUser] = useState(stored);
  const [stats, setStats] = useState({ monthlyAssignments: [] });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [assignments, profile] = await Promise.all([
          getAssignments(),
          getProfile()
        ]);

        if (profile) {
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));
        }

        const teacherId = stored?._id || stored?.id;
        const allAssignments = Array.isArray(assignments) ? assignments : [];

        const myAssignments = allAssignments.filter((a) => {
          const creator = a.createdBy?._id || a.createdBy || a.creatorId || a.creator_id;
          return teacherId && creator && String(creator) === String(teacherId);
        });

        const monthlyMap = new Map();
        myAssignments.forEach((assignment) => {
          const rawDate = assignment.createdAt || assignment.created_at || assignment.createdDate || assignment.deadline;
          const createdDate = rawDate ? new Date(rawDate) : null;
          if (!createdDate || isNaN(createdDate)) {
            return;
          }

          const monthStart = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);
          const key = monthStart.toISOString();

          if (!monthlyMap.has(key)) {
            monthlyMap.set(key, {
              key,
              label: createdDate.toLocaleString("default", { month: "long", year: "numeric" }),
              dateValue: monthStart.getTime(),
              count: 0
            });
          }

          monthlyMap.get(key).count += 1;
        });

        let monthlyAssignments = Array.from(monthlyMap.values()).sort((a, b) => b.dateValue - a.dateValue);

        if (monthlyAssignments.length === 0) {
          const now = new Date();
          monthlyAssignments = [{
            key: now.toISOString(),
            label: now.toLocaleString("default", { month: "long", year: "numeric" }),
            dateValue: now.getTime(),
            count: 0
          }];
        }

        monthlyAssignments = monthlyAssignments.slice(0, 4);

        setStats({ monthlyAssignments });
      } catch (err) {
        console.warn("Failed to load teacher stats", err);
      }
    }

    loadData();
  }, [stored?._id, stored?.id]);

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
    <div className="bg-gray-50 min-h-screen p-4 lg:p-8">
      <main className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Teacher Profile</h2>
            <p className="text-gray-500 mt-1">Manage your academic profile and settings</p>
          </div>
          <a 
            href="mailto:support@example.com" 
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
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
      </main>
    </div>
  );
}
