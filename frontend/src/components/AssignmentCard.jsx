export default function AssignmentCard({ title, desc, date }) {
  return (
    <div className="p-5 bg-white shadow rounded-lg">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-gray-600 mt-2">{desc}</p>

      <p className="text-sm text-gray-500 mt-4">
        📅 Due: {date}
      </p>

      <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
        View / Submit
      </button>
    </div>
  );
}
