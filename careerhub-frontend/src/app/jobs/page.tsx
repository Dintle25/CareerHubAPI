// Jobs listing page at /jobs.
// Server Component — fetches all jobs on the server then filters in JavaScript.
// Filtering is done after the fetch (not via API query params) so the full
// result set can be cached with next: { tags: ["jobs"] } and reused across
// different filter combinations without extra API calls.

import { JobListing } from "@/types";
import JobLinkCard from "@/components/JobLinkCard";
import JobFilters from "@/components/JobFilters";

// Fetch all jobs — cached with "jobs" tag
async function getJobs(): Promise<JobListing[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
    next: { tags: ["jobs"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
 // Return all jobs — status filtering is handled by the filter component
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
  // Read filter values from the URL — Next.js passes searchParams as a prop
  const { q, location, status } = await searchParams;

  // Fetch the full jobs list (cached)
  const allJobs = await getJobs();

  // Filter in JavaScript after the fetch — the cache stores the full result
  // and we slice it differently for each filter combination
  const jobs = allJobs.filter((job) => {
    // Keyword filter — matches title or company (case-insensitive)
    if (q) {
      const keyword = q.toLowerCase();
      const matchesTitle = job.title.toLowerCase().includes(keyword);
      const matchesCompany = job.company.toLowerCase().includes(keyword);
      if (!matchesTitle && !matchesCompany) return false;
    }

    // Location filter — partial match (case-insensitive)
    if (location) {
      const matchesLocation = job.location.toLowerCase().includes(location.toLowerCase());
      if (!matchesLocation) return false;
    }

    // Status filter — "open" shows only active, "all" shows everything
    if (status === "open" && !job.isActive) return false;

    return true;
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Open Positions</h1>

      {/* Filter controls — Client Component, updates the URL on change */}
      <JobFilters />

      {/* Empty state — shown when no jobs match the current filters */}
      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No jobs match your filters.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or clearing the filters.
          </p>
        </div>
      ) : (
        // Two-column grid on small screens and up
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobLinkCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}









// // This is the jobs listing page at /jobs.
// // It runs on the server — no "use client" needed.
// // It fetches jobs fresh on every request (no-store) and renders the grid.

// import { JobListing } from "@/types";
// import JobLinkCard from "@/components/JobLinkCard";

// // Fetches all jobs from the API. Throws if the request fails
// // so the error bubbles up instead of showing an empty page silently.
// async function getJobs(): Promise<JobListing[]> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
//     next: { tags: ["jobs"] },
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
//   }

//   const data = await res.json();
//   const all = Array.isArray(data) ? data : data.data ?? data.value ?? [];

//   // Only show active jobs to candidates — closed jobs are hidden
//   return all.filter((job: JobListing) => job.isActive);
// }

// export default async function JobsPage() {
//   const jobs = await getJobs();

//   return (
//     <main className="mx-auto max-w-4xl px-4 py-10">
//       <h1 className="mb-6 text-2xl font-bold tracking-tight">Open Positions</h1>

//       {/* Show a message if no jobs came back from the API */}
//       {jobs.length === 0 ? (
//         <div className="rounded-xl border border-dashed border-border p-12 text-center">
//           <p className="text-lg font-medium text-muted-foreground">
//             No jobs available right now.
//           </p>
//           <p className="mt-1 text-sm text-muted-foreground">
//             Check back soon — new roles are added regularly.
//           </p>
//         </div>
//       ) : (
//         // Two-column grid on small screens and up, single column on mobile
//         <div className="grid gap-4 sm:grid-cols-2">
//           {jobs.map((job) => (
//             <JobLinkCard key={job.id} job={job} />
//           ))}
//         </div>
//       )}
//     </main>
//   );
// }
