import React, { useState } from "react";

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

    const save = (avatarDataUrl) => {
      const updated = {
        ...(user || {}),
        name: form.name,
        email: form.email,
        bio: form.bio,
        department: form.department,
        institution: form.institution,
        courses: form.courses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((n) => ({ name: n })),
      };
      if (avatarDataUrl) updated.avatar = avatarDataUrl;
      onSave(updated);
    };

    if (form.avatarFile) {
      const reader = new FileReader();
      reader.onload = (ev) => save(ev.target.result);
      reader.readAsDataURL(form.avatarFile);
    } else {
      save();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <button type="button" onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="p-2 border rounded" />

          <label className="text-sm">Email</label>
          <input name="email" value={form.email} onChange={handleChange} className="p-2 border rounded" />

          <label className="text-sm">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} className="p-2 border rounded" />

          <label className="text-sm">Department</label>
          <input name="department" value={form.department} onChange={handleChange} className="p-2 border rounded" />

          <label className="text-sm">Institution</label>
          <input name="institution" value={form.institution} onChange={handleChange} className="p-2 border rounded" />

          <label className="text-sm">Courses (comma separated)</label>
          <input name="courses" value={form.courses} onChange={handleChange} className="p-2 border rounded" />

          <label className="text-sm">Avatar (optional)</label>
          <input name="avatarFile" type="file" accept="image/*" onChange={handleChange} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>
  );
}
