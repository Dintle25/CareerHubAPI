import React from "react";
import { JobListing } from "../types";

// defining props interface in the same file
interface JobCardProps {
  job: JobListing;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

// mapping employmentType to badge colours(not hardcoded for the four values)
const employmentTypeColors: Record<JobListing["jobType"], string> = {
  FullTime: "bg-green-500 text-white",
  PartTime: "bg-blue-500 text-white",
  Contract: "bg-purple-500 text-white",
  Internship: "bg-yellow-500 text-black",
};

// Format salary range
const formatSalary = (min: number, max: number) =>
  `R${min.toLocaleString()} – R${max.toLocaleString()} pm`;

// calculate relative date (not hardcoede)
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
      className={`border rounded p-4 cursor-pointer transition ${
        isSelected ? "border-4 border-blue-600 bg-blue-50" : "border-gray-300"
      }`}
    >
      {/* job title */}
      <h2 className="text-xl font-bold">{job.title}</h2>

      {/* company and location on a singlee line */}
      <p className="text-gray-600">
        {job.company} &middot; {job.location}
      </p>

      {/* employment type as a badge */}
      <span
        className={`inline-block px-2 py-1 text-sm rounded ${employmentTypeColors[job.jobType]}`}
      >
        {job.jobType}
      </span>

      {/* salary */}
      <p className="mt-2 font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>

      {/* postedAt date */}
      <p className="text-sm text-gray-500">{formatRelativeDate(job.postedAt)}</p>

      {/* expired/closed label */}
      {!job.isActive && (
        <p className="text-red-600 font-semibold">Expired / Closed</p>
      )}

      {/* applicant count (only if > 0) */}
      {job.applicantCount > 0 && (
        <p className="text-sm text-gray-700">
          {job.applicantCount} applicants
        </p>
      )}
    </div>
  );
};

export default JobCard;
