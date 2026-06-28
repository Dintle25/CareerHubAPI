"use client";

// Client Component — handles the Close button UI.
// When clicked, fires a Server Action that sends PATCH to the real API
// with { isActive: false } to close the job in the database.

import { useActionState } from "react";
import { closeJobListing } from "@/app/actions/closeJob";

interface CloseJobButtonProps {
  jobId: string;
  isActive: boolean; // use isActive from real API instead of a status string
}

export default function CloseJobButton({ jobId, isActive }: CloseJobButtonProps) {
  // If job is already closed, show nothing in the Action column
  if (!isActive) return null;

  const [state, formAction, isPending] = useActionState(closeJobListing, null);

  // Success — replace button with confirmation message
  if (state?.status === "success") {
    return (
      <p className="text-xs font-medium text-green-600 dark:text-green-400">
        ✓ Closed
      </p>
    );
  }

  return (
    <div>
      <form action={formAction}>
        {/* Hidden field — the Server Action reads jobId from here */}
        <input type="hidden" name="jobId" value={jobId} />
        <button
          type="submit"
          disabled={isPending}
          className={
            isPending
              ? // Grey out while the action is running
                "cursor-not-allowed rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              : // Red button for active jobs
                "rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          }
        >
          {/* Show "Closing…" while waiting for the server */}
          {isPending ? "Closing…" : "Close"}
        </button>
      </form>

      {/* Show error message below the button so the user can retry */}
      {state?.status === "error" && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
    </div>
  );
}




