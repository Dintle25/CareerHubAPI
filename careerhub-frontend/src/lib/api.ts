import { JobListing } from "@/types";

/**
 * Fetches the full list of job listings from the mock API route handler.
 * Pure network logic — no React or component imports.
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

  const data: JobListing[] = await res.json();
  return data;
}