import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

export default function FeedbackPage() {
  const { id } = useParams(); // id = submission id
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [marks, setMarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getSubmission(id)
      .then(setSubmission)
      .catch(e => setMsg(e.message || 'Failed'))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveFeedback() {
    setSaving(true);
    try {
      await api.postFeedback({ submissionId: id, comments: comment, marks: Number(marks) });
      setMsg("Feedback saved");
    } catch (err) {
      setMsg(err.message || 'Failed');
    } finally { setSaving(false); }
  }

  if (loading) return <Loading />;
  if (!submission) return <EmptyState message={msg || 'Submission not found'} />;

  return (
    <div className="p-8 grid grid-cols-3 gap-6">
      <div className="col-span-3 lg:col-span-2 bg-white shadow rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Student Submission</h2>
        <div className="h-96 border rounded flex items-center justify-center text-gray-400">
          Document viewer placeholder
        </div>
      </div>

      <div className="col-span-3 lg:col-span-1 space-y-4">
        <div className="bg-white shadow rounded p-4">
          <div className="font-semibold">{submission.studentName}</div>
          <div className="text-sm text-gray-500">Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '—'}</div>
        </div>

        <div className="bg-white shadow rounded p-4 space-y-3">
          <label className="block text-sm">Marks</label>
          <input type="number" value={marks} onChange={(e)=>setMarks(e.target.value)} className="w-full border rounded p-2" />

          <label className="block text-sm">Feedback Comment</label>
          <textarea value={comment} onChange={(e)=>setComment(e.target.value)} className="w-full border rounded p-2 h-40" />

          <div className="flex justify-between items-center">
            <button className="text-gray-600">Cancel</button>
            <button onClick={saveFeedback} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
              {saving ? 'Saving...' : 'Save Feedback'}
            </button>
          </div>
          {msg && <div className="text-sm text-green-600">{msg}</div>}
        </div>
      </div>
    </div>
  );
}
