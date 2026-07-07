// Job detail page at /jobs/[id].
// Server Component — fetches job and session in parallel.
// Employers see Close and Edit buttons instead of the application form.

import { notFound } from "next/navigation";
import Link from "next/link";
import { JobListing } from "@/types";
import JobStatusBadge from "@/components/JobStatusBadge";
import { auth } from "@/auth";
import type { Metadata } from "next";
import ApplicationWizardClient from "@/components/ApplicationWizardClient";
import CloseJobButton from "@/components/CloseJobButton";

async function getJob(id: string): Promise<JobListing> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${id}`,
    { next: { tags: ["jobs"] } }
  );

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);

  return res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await getJob(id);
    const title = job.title;
    const description = `Apply for ${job.title} at ${job.company} in ${job.location}.`;
    return { title, description, openGraph: { title, description, type: "website" } };
  } catch {
    return { title: "Job Not Found" };
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
          <JobStatusBadge employmentType={job.type} isActive={job.isActive} />
        </div>
        <p className="mt-1 text-gray-600 dark:text-gray-300">
          {job.company} &middot; {job.location}
        </p>
        <p className="mt-4 text-gray-700 dark:text-gray-200 leading-relaxed">
          {job.description}
        </p>

        {/* Employer controls — Edit and Close buttons visible only to employers */}
        {role === "employer" && (
          <div className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
            {/* Edit button — links to edit page */}
            <Link
              href={`/dashboard/listings/${job.id}/edit`}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Edit listing
            </Link>

            {/* Close button — shows AlertDialog confirmation before closing */}
            <CloseJobButton jobId={job.id} isActive={job.isActive} />
          </div>
        )}
      </div>

      {/* Application section */}
      <div className="mt-8">
        {isClosed ? (
          // Job is closed — show banner for everyone
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
          // Employer — cannot apply, controls are shown above instead
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Employers cannot apply for jobs.
            </p>
          </div>
        ) : (
          // Candidate or signed out — show wizard
          <ApplicationWizardClient jobId={job.id} jobTitle={job.title} />
        )}
      </div>
    </main>
  );
}