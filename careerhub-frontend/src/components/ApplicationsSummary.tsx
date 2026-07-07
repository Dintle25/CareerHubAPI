// Async Server Component — fetches its own data, no props needed.
// Gets jobs from the real API and sums up applicationCount from each job.
// The real API includes applicationCount directly on each job object
// so no separate stats endpoint is needed.

import { JobListing } from "@/types";

// Fetch all jobs from the real API
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

// Skeleton shown while this component is loading
export function ApplicationsSummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      {/* Placeholder for the label */}
      <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      {/* Placeholder for the big number */}
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export default async function ApplicationsSummary() {
  const jobs = await getJobs();

  // Add up applicationCount from every job — it comes directly from the real API
  const total = jobs.reduce((sum, job) => sum + (job.applicationCount ?? 0), 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Total Applications
      </p>
      {/* Large prominent count from real database */}
      <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
        {total}
      </p>
    </div>
  );
}

