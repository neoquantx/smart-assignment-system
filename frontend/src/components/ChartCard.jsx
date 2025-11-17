export default function ChartCard({ children, title }) {
  return (
    <div className="bg-white p-6 shadow rounded-lg w-full">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}
