import { useEffect, useState } from "react";
import { api } from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

export default function StudentSubmissions() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api.getSubmissions()
      .then(setItems)
      .catch(e => setErr(e.message || 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (err) return <EmptyState message={err} />;
  if (!items || items.length === 0) return <EmptyState message="You have no submissions yet." />;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Submissions</h1>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3">Assignment</th>
              <th className="text-left px-6 py-3">Date Submitted</th>
              <th className="text-left px-6 py-3">Marks</th>
              <th className="text-left px-6 py-3">Feedback</th>
              <th className="text-left px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id || s.submissionID} className="border-t">
                <td className="px-6 py-4">{s.assignmentTitle ?? s.assignment?.title}</td>
                <td className="px-6 py-4">{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'}</td>
                <td className="px-6 py-4">{s.marks != null ? s.marks : 'Not Graded'}</td>
                <td className="px-6 py-4">{s.feedbackSummary ?? (s.feedback ? 'View Feedback' : '—')}</td>
                <td className="px-6 py-4">{s.status ?? (s.marks != null ? 'Evaluated' : 'Pending')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
