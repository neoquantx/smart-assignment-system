import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

export default function AssignmentSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.getAssignment(id)
      .then(setAssignment)
      .catch(e => setMsg(e.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setMsg("Please choose a file"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('assignmentId', id);
      fd.append('file', file);
      await api.createSubmission(fd);
      setMsg("Uploaded successfully");
      navigate('/student/submissions');
    } catch (err) {
      setMsg(err.message || "Upload failed");
    } finally { setUploading(false); }
  }

  if (loading) return <Loading />;
  if (!assignment) return <EmptyState message={msg || 'Assignment not found'} />;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">{assignment.title}</h1>
      <p className="text-gray-600">{assignment.description}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-dashed border-2 border-gray-300 rounded p-12 flex flex-col items-center">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
          <div className="text-sm text-gray-500 mt-2">Drag & drop or choose file (PDF, DOCX)</div>
        </div>

        {msg && <div className="text-sm text-red-500">{msg}</div>}

        <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-6 py-2 rounded">
          {uploading ? 'Uploading...' : 'Submit Assignment'}
        </button>
      </form>
    </div>
  );
}
