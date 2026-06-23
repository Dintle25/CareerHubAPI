//import { ApplicationRequest, ApplicationResponse, JobListing, JobType } from "@/types";
import { JobListing, JobType, ApplicationRequest, ApplicationResponse } from "@/types";

// Define the structure of one job returned by the C# API
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

// Mirrors the C# PagedResponse<T> wrapper
// Define the structure of the paged response from the API.
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
   // Read the API URL from the environment file
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
   // Create the full URL for the jobs endpoint
  const url = `${baseUrl}/api/jobs`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Failed to fetch jobs: received status ${res.status} (${res.statusText})`
    );
  }

  const paged: PagedResponse<ApiJobResponse> = await res.json();

   // Convert the API data into the JobListing format used by the frontend
  return paged.data.map((job): JobListing => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    // Convert the API job type to the frontend JobType
    jobType: job.type as JobType,  // "FullTime" | "PartTime" | "Contract" | "Internship"
    salaryMin: job.salaryMin ?? 0,
    salaryMax: job.salaryMax ?? 0,
    postedAt: job.postedAt,
    isActive: job.isActive,
    applicantCount: job.applicationCount,
  }));

}


// // Sends a job application to the server and returns the saved result.
// export async function submitApplication(data: ApplicationRequest): Promise<ApplicationResponse> {

//   // Build the full URL — same BASE_URL pattern as fetchJobs
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//   const url = `${baseUrl}/api/applications`;

//   // POST the form data as JSON
//   const res = await fetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" }, // Tell the server we're sending JSON
//     body: JSON.stringify(data),                       // Convert the object to a JSON string
//   });

//   // If the server returned an error (4xx or 5xx), read the Problem Details body and throw
//   if (!res.ok) {
//     const problem = await res.json();
//     throw new Error(problem.detail ?? problem.title); // Use detail first, fall back to title
//   }

//   // All good — parse and return the server's response typed as ApplicationResponse
//   return res.json() as Promise<ApplicationResponse>;
// }

export async function submitApplication(data: ApplicationRequest): Promise<ApplicationResponse> {

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Must include v1 because the C# controller uses versioned routing: api/v{version}/applications
  const res = await fetch(`${baseUrl}/api/v1/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const problem = await res.json();
    throw new Error(problem.detail ?? problem.title);
  }

  return res.json() as Promise<ApplicationResponse>;
}