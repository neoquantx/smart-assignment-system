// src/services/api.js

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default api;

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toMessage(error) {
  if (axios.isAxiosError(error)) {
    const msg =
      error.response?.data?.message ||
      (typeof error.response?.data === "string" ? error.response?.data : null) ||
      error.message;
    return msg || "Request failed";
  }
  return error?.message || "Request failed";
}

// ============= AUTH =============
export async function login(payload) {
  try {
    const res = await api.post("/api/auth/login", payload);
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function registerUser(payload) {
  try {
    const res = await api.post("/api/auth/register", payload);
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// ============= ASSIGNMENTS =============
export async function getAssignments() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const res = await api.get("/api/assignments", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Get assignments error:", err);
    return [];
  }
}

export async function getAssignment(id) {
  try {
    const res = await api.get(`/api/assignments/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function createAssignment(payload) {
  try {
    const res = await api.post("/api/assignments", payload, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// ============= SUBMISSIONS =============
export async function getSubmissions() {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const res = await api.get("/api/submissions", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Get submissions error:", err);
    return [];
  }
}

export async function createSubmission(formData) {
  try {
    const res = await api.post("/api/submissions", formData, {
      headers: {
        ...getAuthHeader(),
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// ============= FEEDBACK =============
export async function postFeedback(payload) {
  try {
    const res = await api.post("/api/feedback", payload, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function getFeedback(id) {
  try {
    const res = await api.get(`/api/feedback/${id}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// ============= USERS =============
export async function getUsers(role) {
  try {
    const res = await api.get(`/api/users?role=${role}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function updateProfile(formData) {
  try {
    const res = await api.put("/api/users/profile", formData, {
      headers: {
        ...getAuthHeader(),
        // Note: Content-Type is automatically set by browser when using FormData
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function getProfile() {
  try {
    const res = await api.get("/api/users/me", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// ============= MESSAGES =============
export async function getMessages(userId) {
  try {
    const res = await api.get(`/api/messages/${userId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function getGroupMessages() {
  try {
    const res = await api.get("/api/messages/group/all", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function getConversations() {
  try {
    const res = await api.get("/api/messages/conversations", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function sendMessage(receiver, message, options = {}) {
  try {
    const res = await api.post(
      "/api/messages",
      { receiver, message, ...options },
      {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function markMessagesAsRead(userId) {
  try {
    const res = await api.put(`/api/messages/read/${userId}`, null, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function markGroupMessagesAsRead() {
  try {
    const res = await api.put("/api/messages/read-group", null, {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

export async function getUnreadSummary() {
  try {
    const res = await api.get("/api/messages/unread-summary", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    throw new Error(toMessage(err));
  }
}

// ============= ANALYTICS =============
export async function getAnalytics() {
  try {
    const res = await api.get("/api/analytics", {
      headers: getAuthHeader(),
    });
    return res.data;
  } catch (err) {
    console.error("Get analytics error:", err);
    return {
      assignmentStats: [],
      submissionStatus: [],
      totals: {
        totalAssignments: 0,
        totalSubmissions: 0,
        pendingEvaluations: 0,
      },
    };
  }
}
