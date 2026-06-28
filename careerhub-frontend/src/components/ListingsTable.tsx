// Async Server Component — fetches jobs from the real API.
// applicationCount comes directly on each job object from the real API
// so no separate stats fetch is needed here.

import Link from "next/link";
import { JobListing } from "@/types";
import CloseJobButton from "@/components/CloseJobButton";

// Fetch all jobs — cached with "jobs" tag so closing a job invalidates this
async function getJobs(): Promise<JobListing[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
    next: { tags: ["jobs"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  // Real API returns { data: [...] }
  return Array.isArray(json) ? json : json.data ?? json.value ?? [];
}

// Skeleton shown while this component is loading — 5 placeholder rows
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
              <td className="px-4 py-3"><div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td>
              <td className="px-4 py-3"><div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td>
              <td className="px-4 py-3"><div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td>
              <td className="px-4 py-3"><div className="h-4 w-14 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" /></td>
              <td className="px-4 py-3"><div className="h-3 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td>
              <td className="px-4 py-3"><div className="h-3 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td>
              <td className="px-4 py-3"><div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ListingsTable() {
  const jobs = await getJobs();

  if (jobs.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No listings yet.</p>
        <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Jobs you post will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Title</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Location</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            {/* applicationCount comes directly from the job object in the real API */}
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Applications</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">View</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {jobs.map((job) => (
            <tr key={job.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{job.title}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.company}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.location}</td>
              <td className="px-4 py-3">
                {/* Green badge for active jobs, red for closed */}
                <span className={
                  job.isActive
                    ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300"
                }>
                  {job.isActive ? "Active" : "Closed"}
                </span>
              </td>
              {/* Real API includes applicationCount on each job — no join needed */}
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {job.applicationCount ?? 0}
              </td>
              <td className="px-4 py-3">
                <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  View
                </Link>
              </td>
              {/* CloseJobButton returns null for already-closed jobs */}
              <td className="px-4 py-3">
                <CloseJobButton jobId={job.id} isActive={job.isActive} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

