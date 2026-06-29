"use client";

// Client Component — reads from Zustand store and renders the table or grid.
// Receives pre-fetched jobs and stats as props from the Server Component page.
// This is the correct pattern: Server Component fetches data, Client Component
// reads UI state from Zustand and renders the appropriate view.

import { useDashboardStore } from "@/stores/dashboardStore";
import Link from "next/link";
import { JobListing } from "@/types";
import CloseJobButton from "@/components/CloseJobButton";
import JobStatusBadge from "@/components/JobStatusBadge";

interface AppStat {
  jobId: string;
  applicationCount: number;
}

interface ListingsWrapperProps {
  // Data comes from the server — no fetch needed here
  jobs: JobListing[];
  statsMap: Record<string, number>;
}

export default function ListingsWrapper({ jobs, statsMap }: ListingsWrapperProps) {
  // Read UI preferences from Zustand store
  const view = useDashboardStore((state) => state.view);
  const showClosedJobs = useDashboardStore((state) => state.showClosedJobs);

  // Filter closed jobs if the employer toggled them off
//   const visibleJobs = showClosedJobs ? jobs : jobs.filter((j) => j.isActive);
const visibleJobs = showClosedJobs 
  ? (jobs ?? []) 
  : (jobs ?? []).filter((j) => j.isActive);

  if (visibleJobs.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No listings found.</p>
      </div>
    );
  }

  // Grid view
  if (view === "grid") {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleJobs.map((job) => (
          <div
            key={job.id}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{job.title}</h2>
              <JobStatusBadge employmentType={job.type} isActive={job.isActive} />
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {job.company} &middot; {job.location}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {statsMap[job.id] ?? job.applicationCount ?? 0} applicants
            </p>
            <div className="mt-3 flex items-center justify-between">
              <Link href={`/jobs/${job.id}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                View
              </Link>
              <CloseJobButton jobId={job.id} isActive={job.isActive} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table view — default
  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Title</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Location</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Applications</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">View</th>
            <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {visibleJobs.map((job) => (
            <tr key={job.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{job.title}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.company}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{job.location}</td>
              <td className="px-4 py-3">
                <span className={
                  job.isActive
                    ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300"
                }>
                  {job.isActive ? "Active" : "Closed"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {statsMap[job.id] ?? job.applicationCount ?? 0}
              </td>
              <td className="px-4 py-3">
                <Link href={`/jobs/${job.id}`} className="text-blue-600 hover:underline dark:text-blue-400">
                  View
                </Link>
              </td>
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