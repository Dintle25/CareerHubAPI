// Async Server Component — fetches jobs and stats, then passes them to
// ListingsWrapper (Client Component) which handles the Zustand store and rendering.
// Server fetches data, client handles UI state — clean separation.

import ListingsWrapper from "@/components/ListingsWrapper";
import { JobListing } from "@/types";

interface AppStat {
  jobId: string;
  applicationCount: number;
}

async function getJobs(): Promise<JobListing[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
    next: { tags: ["jobs"] },
  });
  if (!res.ok) throw new Error(`Failed to fetch jobs: ${res.status}`);
  const json = await res.json();
  return Array.isArray(json) ? json : json.data ?? json.value ?? [];
  console.log("jobs fetched:", json);
}

async function getApplicationStats(): Promise<AppStat[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/stats`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}

// Skeleton shown while this component loads
export function ListingsTableSkeleton() {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <tr>
            {["Title", "Company", "Location", "Status", "Applications", "View", "Action"].map((h) => (
              <th key={h} className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="bg-white dark:bg-gray-900">
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ListingsTable() {
  // Fetch both in parallel on the server
  const [jobs, stats] = await Promise.all([getJobs(), getApplicationStats()]);

  // Convert stats array to a plain object for easy serialization to the client
  const statsMap: Record<string, number> = {};
  stats.forEach((s) => { statsMap[s.jobId] = s.applicationCount; });

  // Pass data as props to the Client Component — it handles Zustand and rendering
  return <ListingsWrapper jobs={jobs} statsMap={statsMap} />;
}