"use client";

// Error boundary for /dashboard — employer only.
// Never shows a retry button for UNAUTHORIZED or FORBIDDEN
// because re-rendering will produce the exact same error.

import { useEffect } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  // Log to console for future Sentry integration
  useEffect(() => { console.error(error); }, [error]);

  // Session expired — redirect to login, retrying will not fix this
  if (error instanceof ApiError && error.isUnauthorized) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Session Expired</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your session has expired. Please sign in again to access the dashboard.
        </p>
        {/* No retry — signing in again is the only fix */}
        <Link href="/login" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Sign in
        </Link>
      </main>
    );
  }

  // Candidate tried to access the employer dashboard
  if (error instanceof ApiError && error.isForbidden) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Access Denied — Employer Access Required
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The dashboard is only available to employers. Candidates can browse and apply for jobs instead.
        </p>
        {/* No retry button — re-rendering will not fix a role mismatch */}
        <Link href="/jobs" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Back to jobs
        </Link>
      </main>
    );
  }

  // Fallback — unknown error, allow retry
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Error</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Try again
        </button>
        <Link href="/" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          Go home
        </Link>
      </div>
    </main>
  );
}