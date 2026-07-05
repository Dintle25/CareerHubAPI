"use client";

// Error boundary for /dashboard/listings/[id]/applicants — employer only.
// Handles the case where an employer tries to view applicants for a listing
// they do not own — API returns 403.

import { useEffect } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ApplicantsError({ error, reset }: ErrorProps) {
  useEffect(() => { console.error(error); }, [error]);

  // Session expired — only fix is to sign in again
  if (error instanceof ApiError && error.isUnauthorized) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Session Expired</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your session has expired. Please sign in again.
        </p>
        <Link href="/login" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Sign in
        </Link>
      </main>
    );
  }

  // Employer tried to view applicants for a listing they don't own
  if (error instanceof ApiError && error.isForbidden) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You can only view applicants for listings you own.
        </p>
        {/* No retry — ownership cannot be fixed by re-rendering */}
        <Link href="/dashboard/listings" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Back to listings
        </Link>
      </main>
    );
  }

  // Listing does not exist
  if (error instanceof ApiError && error.code === "NOT_FOUND") {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Listing Not Found</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This listing does not exist or has been removed.
        </p>
        <Link href="/dashboard/listings" className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Back to listings
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
        <Link href="/dashboard/listings" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
          Back to listings
        </Link>
      </div>
    </main>
  );
}