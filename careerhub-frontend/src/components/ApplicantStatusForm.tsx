"use client";

// Client Component — allows employer to update an applicant's status.
// Uses a select dropdown that calls the API on change.
// Label uses sr-only so it is accessible but not visible.

import { useState } from "react";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: 0, label: "Pending" },
  { value: 1, label: "Reviewing" },
  { value: 2, label: "Accepted" },
  { value: 3, label: "Rejected" },
];

interface Props {
  applicationId: string;
  currentStatus: number;
}

export default function ApplicantStatusForm({ applicationId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, setIsPending] = useState(false);

  async function handleChange(newStatus: number) {
    setIsPending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        toast.error(error.detail ?? "Failed to update status");
        return;
      }

      setStatus(newStatus);
      toast.success("Application status updated.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {/* sr-only label makes the select accessible without showing text on screen */}
      <label htmlFor={`status-${applicationId}`} className="sr-only">
        Application status
      </label>
      <select
        id={`status-${applicationId}`}
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </>
  );
}