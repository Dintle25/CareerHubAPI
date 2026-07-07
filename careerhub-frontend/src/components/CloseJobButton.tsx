"use client";

// CloseJobButton — uses an AlertDialog confirmation before closing a job.
// Approach: keep the Server Action (closeJobListing) and call it programmatically
// via useTransition on confirm. This is chosen over useMutation because:
// - The Server Action already handles cache invalidation via revalidateTag("jobs")
// - useTransition gives us isPending state without converting to a client fetch
// - AlertDialogAction's onClick fires the transition directly — no form needed

import { useState, useTransition, useEffect } from "react";
import { closeJobListing } from "@/app/actions/closeJob";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CloseJobButtonProps {
  jobId: string;
  isActive: boolean;
}

export default function CloseJobButton({ jobId, isActive }: CloseJobButtonProps) {
  // If job is already closed, show nothing in the Action column
  if (!isActive) return null;

  const [closed, setClosed] = useState(false);
  // useTransition gives us isPending while the Server Action is running
  const [isPending, startTransition] = useTransition();

  // After success, show a closed indicator instead of the button
  if (closed) {
    return (
      <p className="text-xs font-medium text-green-600 dark:text-green-400">
        ✓ Closed
      </p>
    );
  }

  // Called when the user confirms in the AlertDialog
  function handleConfirm() {
    startTransition(async () => {
      // Build a FormData manually — the Server Action reads jobId from formData
      const formData = new FormData();
      formData.set("jobId", jobId);

      const result = await closeJobListing(null, formData);

      if (result?.status === "success") {
        toast.success(`"${result.jobTitle}" has been closed.`);
        setClosed(true);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <AlertDialog>
      {/* Trigger opens the dialog — does not submit anything */}
      <AlertDialogTrigger asChild>
        <button
          disabled={isPending}
          className={
            isPending
              ? "cursor-not-allowed rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
              : "rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
          }
        >
          {isPending ? "Closing…" : "Close listing"}
        </button>
      </AlertDialogTrigger>

      {/* Dialog renders in a Radix portal — outside the form element */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this listing?</AlertDialogTitle>
          <AlertDialogDescription>
            This listing will be marked as closed and removed from the public
            jobs board. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Cancel — closes the dialog, listing unchanged */}
          <AlertDialogCancel>Keep listing</AlertDialogCancel>
          {/* Confirm — calls the Server Action via useTransition */}
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
          >
            Close listing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}




// "use client";

// // Client Component — handles the Close button UI.
// // When clicked, fires a Server Action that sends PATCH to the real API
// // with { isActive: false } to close the job in the database.

// import { useActionState } from "react";
// import { closeJobListing } from "@/app/actions/closeJob";

// interface CloseJobButtonProps {
//   jobId: string;
//   isActive: boolean; // use isActive from real API instead of a status string
// }

// export default function CloseJobButton({ jobId, isActive }: CloseJobButtonProps) {
//   // If job is already closed, show nothing in the Action column
//   if (!isActive) return null;

//   const [state, formAction, isPending] = useActionState(closeJobListing, null);

//   // Success — replace button with confirmation message
//   if (state?.status === "success") {
//     return (
//       <p className="text-xs font-medium text-green-600 dark:text-green-400">
//         ✓ Closed
//       </p>
//     );
//   }

//   return (
//     <div>
//       <form action={formAction}>
//         {/* Hidden field — the Server Action reads jobId from here */}
//         <input type="hidden" name="jobId" value={jobId} />
//         <button
//           type="submit"
//           disabled={isPending}
//           className={
//             isPending
//               ? // Grey out while the action is running
//                 "cursor-not-allowed rounded px-3 py-1 text-xs font-medium bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
//               : // Red button for active jobs
//                 "rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
//           }
//         >
//           {/* Show "Closing…" while waiting for the server */}
//           {isPending ? "Closing…" : "Close"}
//         </button>
//       </form>

//       {/* Show error message below the button so the user can retry */}
//       {state?.status === "error" && (
//         <p className="mt-1 text-xs text-red-600 dark:text-red-400">
//           {state.message}
//         </p>
//       )}
//     </div>
//   );
// }




