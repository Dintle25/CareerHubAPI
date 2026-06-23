// "use client";

// import JobList from "@/components/JobList";
// import { JobListSkeleton } from "@/components/JobCardSkeleton";
// import { fetchJobs } from "@/lib/api";
// import { useQuery } from "@tanstack/react-query";
// import React, { useEffect, useState } from "react";

// // Session storage key
// const STORAGE_KEY = "selectedJobId";

// export default function Home() {
//   const {
//     data: jobs,
//     isPending,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//      // Unique key used to cache the jobs
//     queryKey: ["jobs"],
//     // Function that fetches the jobs from the API
//     queryFn: fetchJobs,
//   });

//   const [selectedId, setSelectedId] = useState<string | null>(null);

  
//   // query is pending. If the stored id doesn't match a loaded job,
//   // selectedJob below simply evaluates to undefined and the summary
//   // panel doesn't render — no error, graceful degradation.
//   // Restore the selected job when the page loads
//   useEffect(() => {
//     const stored = sessionStorage.getItem(STORAGE_KEY);
//     if (stored !== null) {
//       setSelectedId(stored);
//     }
//   }, []);

//   // Persist the selected job whenever it changes.
//    // Save the selected job whenever it changes
//   useEffect(() => {
//     if (selectedId !== null) {
//       sessionStorage.setItem(STORAGE_KEY, selectedId);
//     } else {
//       sessionStorage.removeItem(STORAGE_KEY);
//     }
//   }, [selectedId]);

//    // Select or deselect a job
//   const handleSelect = (id: string) => {
//     setSelectedId((prev) => (prev === id ? null : id));
//   };

//   const selectedJob = jobs?.find((job) => job.id === selectedId);

//   return (
//     <main className="p-6">
//       {/* the summary panel, only when a job is selected */}
//       {selectedJob && (
//         <div className="mb-6 rounded border border-gray-300 bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-800">
//           <h2 className="text-lg font-bold text-gray-900 dark:text-white">
//             {selectedJob.title}
//           </h2>
//           <p className="text-gray-700 dark:text-gray-300">
//             {selectedJob.company}
//           </p>
//         </div>
//       )}

//        {/* Show skeleton cards while the jobs are loading. */}
//       {isPending && <JobListSkeleton />}

//        {/* Show an error message and allow the user to try again. */}
//       {isError && (
//         <div className="rounded border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
//           <p className="text-red-700 dark:text-red-300">{error.message}</p>
//           <button
//             onClick={() => refetch()}
//             className="mt-3 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       {/* Display the jobs after they have loaded successfully. */}
//       {!isPending && !isError && jobs && (
//         <JobList jobs={jobs} selectedId={selectedId} onSelect={handleSelect} />
//       )}
//     </main>
//   );
// }

"use client";

import JobList from "@/components/JobList";
import { JobListSkeleton } from "@/components/JobCardSkeleton";
import ApplicationForm from "@/components/ApplicationForm";
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
    // Unique key used to cache the jobs
    queryKey: ["jobs"],
    // Function that fetches the jobs from the API
    queryFn: fetchJobs,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Restore the selected job when the page loads
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setSelectedId(stored);
    }
  }, []);

  // Save the selected job whenever it changes
  useEffect(() => {
    if (selectedId !== null) {
      sessionStorage.setItem(STORAGE_KEY, selectedId);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedId]);

  // Select or deselect a job
  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectedJob = jobs?.find((job) => job.id === selectedId);

  return (
    <main className="p-6">
      {/* Selection panel — always visible when a job is selected. Never removed. */}
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

      {/* Show skeleton cards while the jobs are loading. */}
      {isPending && <JobListSkeleton />}

      {/* Show an error message and allow the user to try again. */}
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

      {/* Display the jobs after they have loaded successfully. */}
      {!isPending && !isError && jobs && (
        <JobList jobs={jobs} selectedId={selectedId} onSelect={handleSelect} />
      )}

      {/* Show the application form below the job list when:
          - jobs have loaded (not pending, not errored)
          - a job has actually been selected
          The selection panel above stays visible alongside the form. */}
      {!isPending && !isError && selectedJob && (
        <div className="mt-8">
          <ApplicationForm jobId={selectedJob.id} jobTitle={selectedJob.title} />
        </div>
      )}
    </main>
  );
}
