import React from "react";
import { JobListing } from "../types";
import JobCard from "./JobCard";

interface JobListProps {
  jobs: JobListing[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, selectedId, onSelect }) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center text-gray-600 p-6">
        <h2 className="text-lg font-semibold">No CareerHub jobs available</h2>
        <p>Check back soon — new opportunities are posted regularly.</p>
      </div>
    );
  }

  return (
    <div>
      {/* result for the count */}
      <p className="mb-4 font-medium">Showing {jobs.length} jobs</p>

      {/* grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job.id} // n/b: key from id, not index
            job={job}
            isSelected={selectedId === job.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default JobList;
