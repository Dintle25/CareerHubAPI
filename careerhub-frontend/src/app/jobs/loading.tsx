// Next.js shows this file automatically while the jobs page is loading.
// Renders 6 skeleton cards in the same grid layout as the real page.

import { JobsGridSkeleton } from "@/components/JobCardSkeleton";

export default function JobsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Placeholder for the "Open Positions" heading */}
      <div className="mb-6 h-8 w-40 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
      {/* Placeholder for the filter bar */}
      <div className="mb-6 flex gap-3">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      <JobsGridSkeleton />
    </main>
  );
}