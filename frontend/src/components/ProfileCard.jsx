import React from "react";

export default function ProfileCard({ user, onEdit, stats = {} }) {
  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">No user data available.</p>
      </div>
    );
  }

  const {
    name,
    email,
    role,
    department,
    institution,
    courses = [],
    bio,
    avatar,
  } = user;

  const avatarEl = avatar ? (
    // avatar stored as data URL or remote URL
    <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
  ) : (
    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
      {name ? name.charAt(0).toUpperCase() : "U"}
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-4">
        {avatarEl}

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{name || "Unknown User"}</h3>
          <p className="text-sm text-gray-500">{email || "no-email@example.com"}</p>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">Role:</span> {role || "-"}
          </div>
          {department && (
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Department:</span> {department}
            </div>
          )}
          {institution && (
            <div className="mt-1 text-sm text-gray-600">
              <span className="font-medium">Institution:</span> {institution}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
          <a href="mailto:support@example.com" className="text-sm text-gray-600 underline">Help & Support</a>
        </div>
      </div>

      {bio && <p className="mt-4 text-sm text-gray-700">{bio}</p>}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Assignments Done</div>
          <div className="text-lg font-semibold">{stats.done ?? 0}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Assignments Left</div>
          <div className="text-lg font-semibold">{stats.left ?? 0}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Total Courses</div>
          <div className="text-lg font-semibold">{(courses && courses.length) || 0}</div>
        </div>
      </div>

      {Array.isArray(courses) && courses.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700">Courses</h4>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
            {courses.map((c, i) => (
              <li key={i} className="px-3 py-2 bg-gray-50 rounded">{c.name || c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
