import React from "react";

/**
 * Skeleton placeholder mirroring JobCard's visual structure:
 * heading (title), detail line (company/location), badge,
 * salary line, posted-date line, and footer (applicant count).
 * No real text — every region is a pulsing block.
 */
export const JobCardSkeleton: React.FC = () => {
  return (
    <div
      className={[
        "rounded-xl border p-5",
        "bg-white dark:bg-gray-800",
        "border-gray-200 dark:border-gray-700",
      ].join(" ")}
    >
      {/* heading area: job title */}
      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* company & location line */}
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* badge area: employment type / status */}
      <div className="mt-3 h-5 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />

      {/* salary line */}
      <div className="mt-3 h-4 w-2/5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* posted-date line */}
      <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* footer: applicant count */}
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
};

/**
 * Renders six JobCardSkeletons in the same grid JobList uses,
 * so layout doesn't shift once real data replaces the skeletons.
 */
export const JobListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  );
};
