// Job detail page at /jobs/[id].
// Server Component — fetches one job on the server and passes data down to the form.
// No "use client" needed here because this component has no state or event handlers.

import { notFound } from "next/navigation";
import Link from "next/link";
import { JobListing } from "@/types";
import ApplicationForm from "@/components/ApplicationForm";
import JobStatusBadge from "@/components/JobStatusBadge";

// Fetches a single job by ID from the API.
// Returns the job on success, calls notFound() on 404, throws on anything else.
async function getJob(id: string): Promise<JobListing> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
    { cache: "no-store" } // always fetch fresh — never serve a stale detail page
  );

  if (res.status === 404) {
    // Tells Next.js to render the nearest not-found.tsx instead of this page
    notFound();
  }

  if (!res.ok) {
    // Any other error (500, network failure etc.) surfaces the error boundary
    throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Page receives params from the URL segment e.g. /jobs/123 → params.id = "123"
export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15 — params is a Promise and must be awaited before use
  const { id } = await params;
  const job = await getJob(id);

  // A job is considered closed when isActive is false
  const isClosed = !job.isActive;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">

      {/* Back link — always visible at the top so the user can return to the list */}
      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to jobs
      </Link>

      {/* ── Job details ─────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">

        {/* Title and badge on the same row */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {job.title}
          </h1>
          <JobStatusBadge employmentType={job.type} isActive={job.isActive} />
        </div>

        {/* Company and location */}
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          {job.company} &middot; {job.location}
        </p>

        {/* Description — shown below the meta info */}
        <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* ── Application section ──────────────────────────────────────────── */}
      <div className="mt-8">
        {isClosed ? (
          // Closed jobs show an informational message instead of the form
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Applications Closed
            </h2>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              This position is no longer accepting applications. Browse other
              open roles on the{" "}
              <Link href="/jobs" className="underline hover:text-yellow-900 dark:hover:text-yellow-100">
                jobs listing page
              </Link>
              .
            </p>
          </div>
        ) : (
          // Open jobs render the Client Component form.
          // This is the Server/Client composition pattern:
          // the server fetches the data, the client handles the interactive form.
          <ApplicationForm jobId={job.id} jobTitle={job.title} />
        )}
      </div>
    </main>
  );
}
