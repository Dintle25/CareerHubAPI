// Home page at /.
// Server Component — no "use client", no useState, no useEffect, no useQuery.
// Renders static HTML only, so there is no JS bundle for this route.
// The two Link buttons use Next.js client-side navigation — no full page reload.

import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">

      {/* Brand heading */}
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Welcome to CareerHub
      </h1>

      {/* Short description */}
      <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
        CareerHub connects job seekers with great opportunities. Browse open
        roles as a candidate, or manage your listings as an employer.
      </p>

      {/* Two call-to-action buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">

        {/* Takes the user to the candidate-facing job grid */}
        <Link
          href="/jobs"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Browse Jobs
        </Link>

        {/* Takes the user to the employer dashboard */}
        <Link
          href="/dashboard/listings"
          className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Employer Dashboard
        </Link>
      </div>
    </main>
  );
}
