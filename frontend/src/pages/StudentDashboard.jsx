import { useEffect, useState } from "react";
import { api } from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import AssignmentCard from "../components/AssignmentCard";

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getAssignments()
      .then(res => setAssignments(res))
      .catch(e => setErr(e.message || 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (err) return <EmptyState message={err} />;
  if (!assignments || assignments.length === 0) return <EmptyState message="No assignments found." />;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Available Assignments</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {assignments.map(a => (
          <AssignmentCard key={a.id || a.assignmentID} title={a.title} desc={a.description} date={a.deadline} />
        ))}
      </div>
    </div>
  );
}
