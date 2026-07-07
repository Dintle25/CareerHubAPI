"use client";

// Global error boundary — catches any unhandled error in a Server Component
// that does not have its own closer error.tsx file.
// The useEffect logs to console for future Sentry integration.

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  // Log to console — this is where a Sentry.captureException call would go
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{error.message}</p>
      <div className="mt-6 flex gap-3">
        {/* Try again re-renders the failed segment */}
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