"use client";

// Client Component — handles the form submission UI for closing a job.
// The actual close logic runs in the Server Action (closeJobListing).
// This component only manages the pending/success/error UI states.

import { useActionState } from "react";
import { closeJobListing } from "@/app/actions/closeJob";

interface CloseJobButtonProps {
  jobId: string;
  currentStatus: string;
}

export default function CloseJobButton({ jobId, currentStatus }: CloseJobButtonProps) {
  // Return nothing for already-closed jobs — no action column content needed
  if (currentStatus === "Closed" || currentStatus === "closed") return null;

  const [state, formAction, isPending] = useActionState(closeJobListing, null);

  // Success state — replace the button with a confirmation message
  if (state?.status === "success") {
    return (
      <p className="text-xs font-medium text-green-600 dark:text-green-400">
        ✓ Closed
      </p>
    );
  }

  return (
    <div>
      {/* Hidden jobId field — read by the Server Action via formData.get("jobId") */}
      <form action={formAction}>
        <input type="hidden" name="jobId" value={jobId} />
        <button
          type="submit"
          disabled={isPending}
          className={
            isPending
              ? // Disabled style while the action is in flight
                "cursor-not-allowed rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              : // Active style
                "rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          }
        >
          {/* Show "Closing…" while the Server Action is running */}
          {isPending ? "Closing…" : "Close"}
        </button>
      </form>

      {/* Error state — show message below the button so the user can retry */}
      {state?.status === "error" && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
    </div>
  );
}
