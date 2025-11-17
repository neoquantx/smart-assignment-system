export default function EmptyState({ message = "No data available" }) {
  return (
    <div className="p-8 bg-white rounded shadow text-gray-500 text-center">
      {message}
    </div>
  );
}
