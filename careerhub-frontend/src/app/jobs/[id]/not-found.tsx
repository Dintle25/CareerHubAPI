// This file is shown automatically by Next.js when notFound() is called
// in the job detail page — e.g. when the user visits /jobs/this-id-is-fake.
// It inherits the root layout so the header and navigation still appear.
// Server Component — no "use client" needed.

import Link from "next/link";

export default function JobNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-center">

      {/* Large status indicator */}
      <p className="text-5xl font-bold text-gray-300 dark:text-gray-600">404</p>

      {/* Clear heading so the user knows what went wrong */}
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Job Not Found
      </h1>

      {/* Friendly explanation */}
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        The job you're looking for doesn't exist or may have been removed.
      </p>

      {/* Send the user back to the listings so they're not stuck */}
      <Link
        href="/jobs"
        className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        ← Back to jobs
      </Link>
    </main>
  );
}
