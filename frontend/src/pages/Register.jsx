export default function Register() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="bg-white shadow p-10 rounded-lg w-96">

        <h1 className="text-3xl font-bold mb-6 text-center">Create Your Account</h1>

        <input className="w-full border p-3 rounded mb-4" placeholder="Full Name" />
        <input className="w-full border p-3 rounded mb-4" placeholder="Email" />

        <select className="w-full border p-3 rounded mb-4">
          <option>Student</option>
          <option>Teacher</option>
        </select>

        <input className="w-full border p-3 rounded mb-4" placeholder="Password" type="password" />
        <input className="w-full border p-3 rounded mb-4" placeholder="Confirm Password" type="password" />

        <button className="w-full bg-blue-600 text-white p-3 rounded-lg">
          Register Now
        </button>

        <p className="mt-4 text-center">
          Already have an account? <a href="/" className="text-blue-600">Login</a>
        </p>

      </div>
    </div>
  );
}
