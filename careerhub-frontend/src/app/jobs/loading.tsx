// Next.js shows this file automatically while the jobs page is loading.
// It must look like the real page so the user sees a smooth transition.
// animate-pulse makes the grey boxes fade in and out to signal loading.

// 7 skeleton cards — one for each job in the mock data
const SKELETON_COUNT = 7;

export default function JobsLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">

      {/* Placeholder for the "Open Positions" heading */}
      <div className="mb-6 h-8 w-40 animate-pulse rounded-md bg-muted" />

      {/* Same grid layout as the real page */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                {/* Placeholder for job title */}
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                {/* Placeholder for company name */}
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                {/* Placeholder for location */}
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
              {/* Placeholder for the status badge */}
              <div className="h-6 w-20 shrink-0 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
