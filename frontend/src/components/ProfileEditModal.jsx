import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileEditModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    department: user?.department || "",
    institution: user?.institution || "",
    courses: (user?.courses || []).map((c) => (c.name ? c.name : c)).join(", "),
    avatarFile: null,
  });

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "avatarFile") {
      setForm((s) => ({ ...s, avatarFile: files[0] }));
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Pass the raw form state to the parent handler
    onSave({
      name: form.name,
      email: form.email,
      bio: form.bio,
      department: form.department,
      institution: form.institution,
      courses: form.courses,
      avatarFile: form.avatarFile
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="edit-profile-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a7a94] focus:border-[#4a7a94] outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Email Address</label>
                <input 
                  name="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a7a94] focus:border-[#4a7a94] outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Bio</label>
              <textarea 
                name="bio" 
                value={form.bio} 
                onChange={handleChange} 
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a7a94] focus:border-[#4a7a94] outline-none transition-all resize-none"
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Department</label>
                <input 
                  name="department" 
                  value={form.department} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a7a94] focus:border-[#4a7a94] outline-none transition-all"
                  placeholder="Computer Science"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Institution</label>
                <input 
                  name="institution" 
                  value={form.institution} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a7a94] focus:border-[#4a7a94] outline-none transition-all"
                  placeholder="University of Technology"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Courses</label>
              <p className="text-xs text-gray-500 mb-2">Enter course name and code separated by colon (e.g., Artificial Intelligence:CS101)</p>
              <input 
                name="courses" 
                value={form.courses} 
                onChange={handleChange} 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4a7a94] focus:border-[#4a7a94] outline-none transition-all"
                placeholder="Artificial Intelligence:CS101, Mathematics:MATH202"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Profile Picture</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  </div>
                  <input name="avatarFile" type="file" accept="image/*" onChange={handleChange} className="hidden" />
                </label>
              </div>
              {form.avatarFile && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Selected: {form.avatarFile.name}
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-profile-form"
            className="px-6 py-2.5 bg-[#2c5f7a] text-white rounded-xl font-medium hover:bg-[#1a3a52] transition-colors shadow-lg shadow-lg"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
