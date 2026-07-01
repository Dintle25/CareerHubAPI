// Navigation card for the /jobs listing page.
// Uses next/image for the company logo placeholder.
// No priority prop — logos in a list are not above the fold in aggregate.
// This targets CLS — next/image reserves space for the image so the layout
// does not shift when the image loads.

import Link from "next/link";
import Image from "next/image";
import { JobListing } from "@/types";
import JobStatusBadge from "@/components/JobStatusBadge";
import { cn } from "@/lib/utils";

interface JobLinkCardProps {
  job: JobListing;
}

const formatSalary = (min: number, max: number) =>
  `R${min.toLocaleString("en-ZA")} – R${max.toLocaleString("en-ZA")} pm`;

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
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "block rounded-xl border p-5 transition-all duration-150",
        "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100",
        "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600",
        !job.isActive && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Company logo — next/image with explicit width and height.
            Uses a placeholder SVG from /public.
            No priority — not above the fold in aggregate across a list.
            Targets CLS by reserving space before the image loads. */}
        <Image
          src="/company-logo.svg"
          alt={`${job.company} logo`}
          width={48}
          height={48}
          className="rounded-lg shrink-0"
        />

        <div className="flex-1 min-w-0">
          {/* Job title */}
          <h2 className="text-xl font-bold">{job.title}</h2>

          {/* Company and location */}
          <p className="text-gray-600 dark:text-gray-300">
            {job.company} &middot; {job.location}
          </p>

          {/* Status badge */}
          <JobStatusBadge employmentType={job.type} isActive={job.isActive} />

          {/* Salary */}
          <p className="mt-2 font-medium text-gray-900 dark:text-gray-100">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </p>

          {/* Posted date */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatRelativeDate(job.postedAt)}
          </p>

          {/* Applicant count */}
          {job.applicationCount > 0 && (
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {job.applicationCount} applicants
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default JobLinkCard;