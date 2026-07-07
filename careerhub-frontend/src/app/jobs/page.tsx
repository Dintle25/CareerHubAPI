// Jobs listing page at /jobs.
// Server Component — fetches all jobs then filters in JavaScript.
// Handles two distinct empty states:
// 1. No jobs in the database at all — nothing the user can do
// 2. Filters eliminated all results — show "Clear all filters" button

import { JobListing } from "@/types";
import JobLinkCard from "@/components/JobLinkCard";
import JobFilters from "@/components/JobFilters";
import ClearFiltersButton from "@/components/ClearFiltersButton";

// Fetch all jobs — cached with "jobs" tag
async function getJobs(): Promise<JobListing[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
    next: { tags: ["jobs"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? data.value ?? [];
}

interface JobsPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    status?: string;
  }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const { q, location, status } = await searchParams;

  // Fetch the full unfiltered list
  const allJobs = await getJobs();

  // Check if filters are active — used to distinguish the two empty states
  const hasActiveFilters = !!(q || location || (status && status !== "all"));

  // Filter in JavaScript after the fetch
  const jobs = allJobs.filter((job) => {
    if (q) {
      const keyword = q.toLowerCase();
      if (!job.title.toLowerCase().includes(keyword) && !job.company.toLowerCase().includes(keyword)) return false;
    }
    if (location) {
      if (!job.location.toLowerCase().includes(location.toLowerCase())) return false;
    }
    if (status === "open" && !job.isActive) return false;
    return true;
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Open Positions</h1>

      {/* Filter controls */}
      <JobFilters />

      {jobs.length === 0 ? (
        allJobs.length === 0 ? (
          // State 1 — database is empty, no jobs at all
          // No action button — there is nothing the user can do
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              No jobs are currently listed.
            </p>
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Check back soon — new roles are added regularly.
            </p>
          </div>
        ) : (
          // State 2 — filters eliminated all results
          // Show active filters and a "Clear all filters" button
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              No jobs match your search.
            </p>
            {/* Show which filters are active so the user knows what to clear */}
            <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
              {[q && `keyword "${q}"`, location && `location "${location}"`, status === "open" && "open jobs only"]
                .filter(Boolean)
                .join(", ")}
            </p>
            {/* Client Component button that resets all nuqs params */}
            <div className="mt-4">
              <ClearFiltersButton />
            </div>
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobLinkCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}