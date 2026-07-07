"use server";

// Server Action — runs on the server only, never in the browser.
// Uses DELETE on the real .NET API which sets isActive = false in the database
// without actually removing the record — it just closes the listing.
// Then invalidates the "jobs" cache so both /jobs and /dashboard/listings
// show the updated status on the next page load.

import { revalidateTag } from "next/cache";

// null = not fired yet, success = job closed, error = something went wrong
export type CloseJobState =
  | { status: "success"; jobTitle: string }
  | { status: "error"; message: string }
  | null;

export async function closeJobListing(
  prevState: CloseJobState,
  formData: FormData
): Promise<CloseJobState> {
  // Read the jobId from the hidden form input
  const jobId = formData.get("jobId");

  // Return error immediately if jobId is missing — no network call needed
  if (!jobId || typeof jobId !== "string" || jobId.trim() === "") {
    return { status: "error", message: "Job ID is missing. Please try again." };
  }

  // First fetch the job title so we can show it in the success message
  const jobRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`
  );
  const jobData = await jobRes.json().catch(() => ({}));
  const jobTitle = jobData.title ?? "the job";

  // DELETE closes the job in the database (sets isActive = false)
  // The real .NET API uses DELETE for closing, not PATCH
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`,
    { method: "DELETE" }
  );

  // Return error if the API call failed
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      status: "error",
      message: body.detail ?? `Failed to close job (${res.status})`,
    };
  }

  // Clear the "jobs" cache — next visit to /jobs or /dashboard/listings
  // will fetch fresh data from the API showing the job as closed
  revalidateTag("jobs","page");

  return { status: "success", jobTitle };
}


