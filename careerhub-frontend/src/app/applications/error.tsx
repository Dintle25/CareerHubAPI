"use client";

// Error boundary for /applications — candidate's application history.
// UNAUTHORIZED and FORBIDDEN never show a retry button.

import { useEffect } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ApplicationsError({ error, reset }: ErrorProps) {
  useEffect(() => { console.error(error); }, [error]);

  // Session expired — only fix is to sign in again
  if (error instanceof ApiError && error.isUnauthorized) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Session Expired</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your session has expired. Please sign in again to view your applications.
        </p>
        <Link href="/login" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Sign in
        </Link>
      </main>
    );
  }

  // Wrong role — only candidates can view application history
  if (error instanceof ApiError && error.isForbidden) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Candidate Access Required</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Only candidates can view application history.
        </p>
        {/* No retry — role mismatch cannot be fixed by re-rendering */}
        <Link href="/jobs" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Browse jobs
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
