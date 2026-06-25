// Async Server Component — fetches its own data, no props needed.
// Wrapped in a Suspense boundary on the dashboard page so it streams in
// independently of the ListingsTable component.

interface AppStat {
  jobId: string;
  applicationCount: number;
}

// Fetches application stats — always fresh since applications arrive at any time.
async function getApplicationStats(): Promise<AppStat[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Skeleton shown by Suspense while this component is loading.
// Matches the card dimensions so the layout doesn't shift when the real card arrives.
export function ApplicationsSummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      {/* Placeholder for the "Total Applications" label */}
      <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      {/* Placeholder for the big number */}
      <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

// The real component — adds up all application counts across every job.
export default async function ApplicationsSummary() {
  const stats = await getApplicationStats();

  // Sum every job's application count into one total
  const total = stats.reduce((sum, s) => sum + s.applicationCount, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        Total Applications
      </p>
      {/* Large prominent count */}
      <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-gray-100">
        {total}
      </p>
    </div>
  );
}
