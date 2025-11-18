// src/services/api.js

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(opts.headers || {}),
      },
      ...opts,
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return res.json();
    }
    return res.text();
  } catch (err) {
    console.error("API Error:", err);
    throw err;
  }
}

// ============= AUTH =============
export async function login(payload) {
  return await request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload) {
  return await request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ============= ASSIGNMENTS =============
export async function getAssignments() {
  const token = localStorage.getItem("token");
  if (!token) return [];
  
  try {
    return await request("/assignments", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Get assignments error:", err);
    return [];
  }
}

export async function getAssignment(id) {
  const token = localStorage.getItem("token");
  return await request(`/assignments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createAssignment(payload) {
  const token = localStorage.getItem("token");
  return await request("/assignments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

// ============= SUBMISSIONS =============
export async function getSubmissions() {
  const token = localStorage.getItem("token");
  if (!token) return [];
  
  try {
    return await request("/submissions", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Get submissions error:", err);
    return [];
  }
}

export async function createSubmission(formData) {
  const token = localStorage.getItem("token");
  return await request("/submissions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

// ============= FEEDBACK =============
export async function postFeedback(payload) {
  const token = localStorage.getItem("token");
  return await request("/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getFeedback(id) {
  const token = localStorage.getItem("token");
  return await request(`/feedback/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ============= ANALYTICS =============
export async function getAnalytics() {
  const token = localStorage.getItem("token");
  try {
    return await request("/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Get analytics error:", err);
    return { 
      assignmentStats: [], 
      submissionStatus: [], 
      totals: { 
        totalAssignments: 0, 
        totalSubmissions: 0, 
        pendingEvaluations: 0 
      } 
    };
  }
}
