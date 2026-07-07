"use client";

// Dashboard applicants page at /dashboard/applicants — employer only.
// Shows all applications across all listings.
// Allows employer to update application status.
// Client Component because it needs localStorage JWT for API calls.

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Application {
  id: string;
  jobId: string;
  email: string;
  submittedAt: string;
  status: string;
}

// Status options matching the backend ApplicationStatus enum
const STATUS_OPTIONS = ["Submitted", "Reviewing", "Accepted", "Rejected"];

const STATUS_COLOURS: Record<string, string> = {
  Submitted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Reviewing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Accepted: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function DashboardApplicantsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("ch_token");
    if (!token) { setLoading(false); return; }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.value ?? data.data ?? [];
        setApplications(list);
      })
      .catch(() => toast.error("Failed to load applications."))
      .finally(() => setLoading(false));
  }, []);

  async function updateStatus(applicationId: string, newStatus: string) {
    setUpdating(applicationId);
    const token = localStorage.getItem("ch_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error.detail ?? "Failed to update status.");
        return;
      }

      // Update local state so UI reflects the change immediately
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      toast.success(`Status updated to ${newStatus}.`);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <main>
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">All Applicants</h1>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">All Applicants</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {applications.length} {applications.length === 1 ? "application" : "applications"} total
      </p>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No applications yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Job ID</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {applications.map((app) => (
                <tr key={app.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{app.email}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs font-mono">{app.jobId.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {/* Show current status as a coloured badge */}
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOURS[app.status] ?? STATUS_COLOURS.Submitted}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Dropdown to update status — calls PATCH /api/v1/applications/:id/status */}
                    <label htmlFor={`status-${app.id}`} className="sr-only">Update status</label>
                    <select
                      id={`status-${app.id}`}
                      value={app.status}
                      disabled={updating === app.id}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}