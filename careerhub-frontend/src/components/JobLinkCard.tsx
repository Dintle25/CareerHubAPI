// This card is for navigation. Clicking it takes the user to /jobs/[id].
// It is a Server Component — no state, no event handlers, no "use client" needed.

import Link from "next/link";
import { JobListing } from "@/types";
import JobStatusBadge from "@/components/JobStatusBadge";
import { cn } from "@/lib/utils";

interface JobLinkCardProps {
  job: JobListing;
}

// Turns two numbers into a readable salary string e.g. "R45 000 – R65 000 pm"
const formatSalary = (min: number, max: number) =>
  `R${min.toLocaleString("en-ZA")} – R${max.toLocaleString("en-ZA")} pm`;

// Turns an ISO date into a relative label e.g. "3 days ago"
const formatRelativeDate = (isoDate: string) => {
  const posted = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const JobLinkCard = ({ job }: JobLinkCardProps) => {
  return (
    // Wrap the whole card in a Link so the entire area is clickable
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "block rounded-xl border p-5 transition-all duration-150",
        "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600",
        // Fade closed jobs so they look less prominent
        !job.isActive && "opacity-70"
      )}
    >
      {/* Job title */}
      <h2 className="text-xl font-bold">{job.title}</h2>

      {/* Company and location on one line */}
      <p className="text-gray-600 dark:text-gray-300">
        {job.company} &middot; {job.location}
      </p>

      {/* Shows job type badge and a red "Closed" badge if not active */}
      <JobStatusBadge employmentType={job.type} isActive={job.isActive} />

      {/* Salary range */}
      <p className="mt-2 font-medium text-gray-900 dark:text-gray-100">
        {formatSalary(job.salaryMin, job.salaryMax)}
      </p>

      {/* How long ago the job was posted */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {formatRelativeDate(job.postedAt)}
      </p>

      {/* Only show applicant count if there is at least one */}
      {job.applicationCount > 0 && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {job.applicationCount} applicants
        </p>
      )}
    </Link>
  );
};

export default JobLinkCard;
