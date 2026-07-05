"use client";

// Client Component — fetches applications using the JWT stored in localStorage.
// Must be a Client Component because localStorage is browser-only.

import { useEffect, useState } from "react";
import Link from "next/link";

interface Application {
  id: string;
  jobId: string;
  email: string;
  submittedAt: string;
  status: number;
  fullName?: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: "Pending",
  1: "Reviewing",
  2: "Accepted",
  3: "Rejected",
};

const STATUS_COLOURS: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  1: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  2: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  3: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Read JWT from localStorage — set during login
    const token = localStorage.getItem("ch_token");

    if (!token) {
      setError("No session found. Please sign in again.");
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.value ?? data.data ?? [];
        setApplications(list);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No applications yet.</p>
        <Link href="/jobs" className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Job</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Submitted</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {applications.map((app) => (
            <tr key={app.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
              <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                {app.fullName ?? app.email}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {new Date(app.submittedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOURS[app.status] ?? STATUS_COLOURS[0]}`}>
                  {STATUS_LABELS[app.status] ?? "Pending"}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link href={`/jobs/${app.jobId}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  View job
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}