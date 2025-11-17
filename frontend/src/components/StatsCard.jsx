export default function StatsCard({ icon, label, value }) {
  return (
    <div className="flex items-center bg-white p-6 shadow rounded-lg">
      <div className="text-3xl mr-4">{icon}</div>
      <div>
        <p className="text-gray-500">{label}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </div>
  );
}
