export default function Sidebar() {
  return (
    <div className="w-64 bg-white h-screen shadow-md p-6">
      <h2 className="text-lg font-bold mb-6">Student Role</h2>

      <ul className="space-y-4">
        <li><a href="/student/dashboard" className="hover:text-blue-600">Assignments</a></li>
        <li><a href="/student/submissions" className="hover:text-blue-600">My Submissions</a></li>
        <li><a href="/profile" className="hover:text-blue-600">Profile</a></li>
      </ul>
    </div>
  );
}
