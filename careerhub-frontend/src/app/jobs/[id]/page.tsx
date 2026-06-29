// Job detail page at /jobs/[id].
// Server Component — fetches job and session in parallel using Promise.all.
// Shows different content based on the user's role:
// - Employer: cannot apply message
// - Signed out: form with sign-in note
// - Candidate: full application form

import { notFound } from "next/navigation";
import Link from "next/link";
import { JobListing } from "@/types";
import ApplicationForm from "@/components/ApplicationForm";
import JobStatusBadge from "@/components/JobStatusBadge";
import { auth } from "@/auth";

async function getJob(id: string): Promise<JobListing> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
    { next: { tags: ["jobs"] } }
  );

  if (res.status === 404) notFound();

  if (!res.ok) {
    throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch job and session at the same time — neither waits for the other
  const [job, session] = await Promise.all([getJob(id), auth()]);

  const isClosed = !job.isActive;
  const role = session?.user?.role;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">

      <Link
        href="/jobs"
        className="mb-6 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        ← Back to jobs
      </Link>

      {/* Job details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {job.title}
          </h1>
          <JobStatusBadge employmentType={job.type} isActive={job.isActive} />
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          {job.company} &middot; {job.location}
        </p>
        <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed">
          {job.description}
        </p>
      </div>

      {/* Application section */}
      <div className="mt-8">
        {isClosed ? (
          // Job is closed — no one can apply
          <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center dark:border-yellow-800 dark:bg-yellow-950">
            <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Applications Closed
            </h2>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
              This position is no longer accepting applications.{" "}
              <Link href="/jobs" className="underline">Browse other roles</Link>.
            </p>
          </div>
        ) : role === "employer" ? (
          // Employer — cannot apply for jobs
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Employers cannot apply for jobs.
            </p>
          </div>
        ) : !session ? (
          // Signed out — show form note with sign-in link
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You must be signed in to apply.{" "}
                <Link href="/login" className="font-semibold underline">
                  Sign in here
                </Link>
                .
              </p>
            </div>
            {/* Show the form so they can see it — but submitting requires sign in */}
            <ApplicationForm jobId={job.id} jobTitle={job.title} />
          </div>
        ) : (
          // Candidate — full form
          <ApplicationForm jobId={job.id} jobTitle={job.title} />
        )}
      </div>
    </main>
  );
}