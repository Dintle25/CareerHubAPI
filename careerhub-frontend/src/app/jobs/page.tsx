// This is the jobs listing page at /jobs.
// It runs on the server — no "use client" needed.
// It fetches jobs fresh on every request (no-store) and renders the grid.

import { JobListing } from "@/types";
import JobLinkCard from "@/components/JobLinkCard";

// Fetches all jobs from the API. Throws if the request fails
// so the error bubbles up instead of showing an empty page silently.
async function getJobs(): Promise<JobListing[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
    next: { tags: ["jobs"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const all = Array.isArray(data) ? data : data.data ?? data.value ?? [];

  // Only show active jobs to candidates — closed jobs are hidden
  return all.filter((job: JobListing) => job.isActive);
}

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Open Positions</h1>

      {/* Show a message if no jobs came back from the API */}
      {jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No jobs available right now.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back soon — new roles are added regularly.
          </p>
        </div>
      ) : (
        // Two-column grid on small screens and up, single column on mobile
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => (
            <JobLinkCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </main>
  );
}
