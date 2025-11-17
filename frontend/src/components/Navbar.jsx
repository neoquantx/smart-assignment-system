export default function Navbar() {
  return (
    <div className="w-full bg-white shadow-sm flex justify-between items-center px-6 py-4">
      <h1 className="text-2xl font-bold">AMS</h1>

      <div className="flex items-center space-x-8">
        <a href="/assignments" className="text-gray-600 hover:text-black">Assignments</a>
        <a href="/submissions" className="text-gray-600 hover:text-black">Submissions</a>
        <a href="/teacher/analytics" className="text-gray-600 hover:text-black">Analytics</a>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>
    </div>
  );
}
