"use client";

// Client Component wrapper for ApplicationWizard.
// dynamic() with ssr: false must live in a Client Component — it cannot be
// used directly in a Server Component page.
// The loading skeleton reserves h-96 of space while the wizard chunk downloads,
// preventing layout shift (targets CLS).

import dynamic from "next/dynamic";

const ApplicationWizard = dynamic(
  () => import("@/components/ApplicationWizard"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 h-96" />
    ),
  }
);

interface Props {
  jobId: string;
  jobTitle: string;
}

// Re-export with the same props so the Server Component page can use it
export default function ApplicationWizardClient({ jobId, jobTitle }: Props) {
  return <ApplicationWizard jobId={jobId} jobTitle={jobTitle} />;
}