import { JobListing } from "@/types";
import React from "react";
import JobStatusBadge from "./JobStatusBadge";
import { cn } from "@/lib/utils";

// defining props interface in the same file
interface JobCardProps {
  job: JobListing;
  isSelected: boolean;
  onSelect: (id: string) => void;
}


// // Format salary range
// const formatSalary = (min: number, max: number) =>
//   `R${min.toLocaleString()} – R${max.toLocaleString()} pm`;
// Format salary range consistently
const formatSalary = (min: number, max: number) =>
  `R${min.toLocaleString("en-ZA")} – R${max.toLocaleString("en-ZA")} pm`;


// // Calculate how long ago the job was posted
const formatRelativeDate = (isoDate: string) => {
  const posted = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} months ago`;
};

const JobCard: React.FC<JobCardProps> = ({ job, isSelected, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(job.id)}
      className={cn(
        // Basic card style
        "cursor-pointer rounded-xl border p-5 transition-all duration-150",

        // Light and dark mode colours
        "bg-white dark:bg-gray-800",
        "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100",

        // Highlight the selected card
        isSelected
          ? "border-blue-500 shadow-md ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-900"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600",

        // Fade the card if the job is closed
        !job.isActive && "opacity-70"
      )}
    >
      {/* job title */}
      <h2 className="text-xl font-bold">{job.title}</h2>

      {/* company and location on a singlee line */}
      <p className="text-gray-600 dark:text-gray-300">
        {job.company} &middot; {job.location}
      </p>

      {/* employment type as a badge */}
      <JobStatusBadge
        employmentType={job.type}
        isActive={job.isActive}
      />

      {/* salary */}
      <p className="mt-2 font-medium text-gray-900 dark:text-gray-100">{formatSalary(job.salaryMin, job.salaryMax)}</p>

      {/* postedAt date */}
      <p className="text-sm text-gray-500 dark:text-gray-400">{formatRelativeDate(job.postedAt)}</p>


      {/* applicant count (only if > 0) */}
      {job.applicationCount > 0 && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {job.applicationCount} applicants
        </p>
      )}
    </div>
  );
};

export default JobCard;
