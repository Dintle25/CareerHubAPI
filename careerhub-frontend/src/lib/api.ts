import { JobListing, JobType } from "@/types";

// Raw shape of each job object returned by the C# API.
// Field names follow ASP.NET Core's default camelCase JSON serialisation.
interface ApiJobResponse {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;          // C# enum serialised as string e.g. "FullTime"
  closingDate: string;
  postedAt: string;
  isActive: boolean;
  salaryDisplay: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applicationCount: number; // C# uses ApplicationCount, TS uses applicantCount
}

// Mirrors the C# PagedResponse<T> wrapper.
interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Fetches jobs from the real C# API, unwraps the paged wrapper,
 * and maps the response shape to the frontend JobListing interface.
 */
export async function fetchJobs(): Promise<JobListing[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}/api/jobs`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch jobs: received status ${res.status} (${res.statusText})`
    );
  }

  const paged: PagedResponse<ApiJobResponse> = await res.json();

  return paged.data.map((job): JobListing => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    jobType: job.type as JobType,  // "FullTime" | "PartTime" | "Contract" | "Internship"
    salaryMin: job.salaryMin ?? 0,
    salaryMax: job.salaryMax ?? 0,
    postedAt: job.postedAt,
    isActive: job.isActive,
    applicantCount: job.applicationCount,
  }));
}
