"use server";

// Server Action — runs on the server only, never in the browser.
// Closes a job listing by sending PATCH to the API, then invalidates
// the "jobs" cache tag so both /jobs and /dashboard/listings fetch fresh data.

import { revalidateTag } from "next/cache";

// Discriminated union for the action state.
// null = initial state (no action fired yet)
// success = job was closed — includes the job title for confirmation
// error = something went wrong — includes a message for the user
export type CloseJobState =
  | { status: "success"; jobTitle: string }
  | { status: "error"; message: string }
  | null;

export async function closeJobListing(
  prevState: CloseJobState,
  formData: FormData
): Promise<CloseJobState> {
  // Read jobId from the hidden form input
  const jobId = formData.get("jobId");

  // Return an error immediately if jobId is missing — no network call needed
  if (!jobId || typeof jobId !== "string" || jobId.trim() === "") {
    return { status: "error", message: "Job ID is missing. Please try again." };
  }

  // Send PATCH to the API to update the job status to Closed
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${jobId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Closed" }),
    }
  );

  // If the PATCH failed, read the API's error detail and return an error state
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      status: "error",
      message: body.detail ?? `Failed to close job (${res.status})`,
    };
  }

  const job = await res.json();

  // Invalidate the "jobs" cache tag — next request to /jobs or /dashboard/listings
  // will fetch fresh data instead of serving the stale cached response
  revalidateTag("jobs","max");

  return { status: "success", jobTitle: job.title };
}