// src/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api"; // <-- your existing API wrapper
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch analytics data
  useEffect(() => {
    setLoading(true);

    api.getAnalytics()
      .then((res) => setData(res))
      .catch((err) => setError(err.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <EmptyState message={error} />;
  if (!data) return <EmptyState message="No analytics found." />;

  const { assignments = [], submissionStatus = [], totals = {} } = data;

  const COLORS = ["#38BDF8", "#4ADE80", "#FBBF24", "#F87171"];

  return (
    <div className="p-8 space-y-10">

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Assignments</p>
          <p className="text-3xl font-bold">{totals.totalAssignments ?? "-"}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Total Submissions</p>
          <p className="text-3xl font-bold">{totals.totalSubmissions ?? "-"}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Pending Evaluations</p>
          <p className="text-3xl font-bold">{totals.pendingEvaluations ?? "-"}</p>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Average Marks per Assignment
          </h2>

          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={assignments}>
                <XAxis dataKey="title" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgMark" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            Submission Status Overview
          </h2>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={submissionStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {submissionStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-3">
            {submissionStatus.map((s, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex gap-2 items-center">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[i] }}
                  ></span>
                  <span>{s.name}</span>
                </div>
                <span className="text-gray-600">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
