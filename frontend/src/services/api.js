// src/services/api.js
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  // try parse JSON but handle empty responses
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

// analytics helper
export async function getAnalytics() {
  return request("/analytics");
}

// other helpers you need:
// export async function getAssignments() { return request('/assignments'); }
// export async function getAssignment(id) { return request(`/assignments/${id}`); }
// export async function createSubmission(formData) { return request('/submissions', { method: 'POST', body: formData }); }
