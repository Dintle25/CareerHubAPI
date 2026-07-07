"use client";

// Error boundary for /apply/[jobId] — the application wizard route.
// Knows the user must be a signed-in candidate to be here.

import { useEffect } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ApplyError({ error, reset }: ErrorProps) {
  useEffect(() => { console.error(error); }, [error]);

  // Session expired — redirect to login, retrying will not fix this
  if (error instanceof ApiError && error.isUnauthorized) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Session Expired</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your session has expired. Please sign in again to continue your application.
        </p>
        <Link href="/login" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Sign in
        </Link>
      </main>
    );
  }

  // Wrong role — employer tried to access the apply route
  if (error instanceof ApiError && error.isForbidden) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Candidate Access Required</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Only candidates can apply for jobs. Employers can view listings from the dashboard.
        </p>
        {/* No retry — role mismatch cannot be fixed by re-rendering */}
        <Link href="/jobs" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Back to jobs
        </Link>
      </main>
    );
  }

  // Job does not exist
  if (error instanceof ApiError && error.code === "NOT_FOUND") {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Job Not Found</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This job listing no longer exists or has been removed.
        </p>
        <Link href="/jobs" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Back to jobs
        </Link>
      </main>
    );
  }

  // Fallback — unknown error, allow retry
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={reset} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Try again
        </button>
        <Link href="/jobs" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          Back to jobs
        </Link>
      </div>
    </main>
  );
}