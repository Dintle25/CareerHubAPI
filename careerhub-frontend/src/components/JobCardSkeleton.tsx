// Skeleton card that matches JobLinkCard's dimensions and structure.
// Same padding (p-5), same rounded corners, same border — so the layout
// does not shift when real cards replace the skeletons.
// Each placeholder bar approximates the text line it replaces.

export function JobCardSkeleton() {
  return (
    <div className="block rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">

      {/* Title — tall bar matching text-xl font-bold */}
      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* Company · location — shorter bar below title */}
      <div className="mt-1.5 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* Status badge — pill shape */}
      <div className="mt-2 h-5 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />

      {/* Salary range — medium width */}
      <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* Relative date — narrow */}
      <div className="mt-1.5 h-3 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* Applicant count — narrow */}
      <div className="mt-1 h-3 w-1/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

// 6 skeleton cards — one grid of skeletons for the /jobs loading state.
// 6 is chosen because it fills two rows of the sm:grid-cols-2 layout without
// implying a specific total count. Too few (e.g. 2) makes the page feel sparse;
// too many (e.g. 20) creates false expectations about how many jobs exist.
export function JobsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}