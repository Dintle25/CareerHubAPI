"use client";

import JobList from "@/components/JobList";
import { JobListSkeleton } from "@/components/JobCardSkeleton";
import { fetchJobs } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";

// Session storage key
const STORAGE_KEY = "selectedJobId";

export default function Home() {
  const {
    data: jobs,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Restore the previously selected job id on mount.
  // No validation against `jobs` here — jobs is undefined while the
  // query is pending. If the stored id doesn't match a loaded job,
  // selectedJob below simply evaluates to undefined and the summary
  // panel doesn't render — no error, graceful degradation.
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setSelectedId(stored);
    }
  }, []);

  // Persist the selected job whenever it changes.
  useEffect(() => {
    if (selectedId !== null) {
      sessionStorage.setItem(STORAGE_KEY, selectedId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedId]);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectedJob = jobs?.find((job) => job.id === selectedId);

  return (
    <main className="p-6">
      {/* the summary panel, only when a job is selected */}
      {selectedJob && (
        <div className="mb-6 rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {selectedJob.title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            {selectedJob.company}
          </p>
        </div>
      )}

      {/* pending: skeleton only */}
      {isPending && <JobListSkeleton />}

      {/* error: styled panel with retry, no job grid */}
      {isError && (
        <div className="rounded border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
          <p className="text-red-700 dark:text-red-300">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      )}

      {/* success: guard against jobs being undefined */}
      {!isPending && !isError && jobs && (
        <JobList jobs={jobs} selectedId={selectedId} onSelect={handleSelect} />
      )}
    </main>
  );
}
