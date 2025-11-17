export default function Login() {
  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="bg-orange-200"></div>

      <div className="flex items-center justify-center bg-gray-50">
        <div className="w-96">
          <h1 className="text-3xl font-bold mb-6">Welcome Back</h1>

          <input className="w-full border p-3 rounded mb-4" placeholder="Email" />
          <input className="w-full border p-3 rounded mb-4" placeholder="Password" type="password" />

          <select className="w-full border p-3 rounded mb-6">
            <option>Student</option>
            <option>Teacher</option>
          </select>

          <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
            Log In
          </button>

          <p className="mt-4 text-center">
            Don't have an account? <a href="/register" className="text-blue-600">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}
