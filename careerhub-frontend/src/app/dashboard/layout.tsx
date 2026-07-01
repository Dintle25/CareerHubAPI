// Dashboard layout — wraps every page inside /dashboard with a sidebar.
// Server Component — no state or interactivity needed here.
// Next.js renders this layout once and keeps it mounted while the user
// navigates between dashboard pages — the sidebar never re-renders or flickers.

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Two-column layout: fixed sidebar on the left, flexible content on the right.
    // min-h-screen keeps the sidebar full height even on short pages.
    <div className="flex min-h-screen">

      {/*  Sidebar ------------------------------------------------------------------------------------------- */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 px-4 py-8 dark:border-gray-700 dark:bg-gray-900">

        {/* Section heading */}
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Employer Dashboard
        </p>

        {/* Navigation links */}
        <nav className="flex flex-col gap-2">
          {/* Takes the employer to the data table of all listings */}
          <Link
            href="/dashboard/listings"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            All Listings
          </Link>

          {/* Lets the employer see what candidates see */}
          <Link
            href="/jobs"
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            View as Candidate
          </Link>
        </nav>
      </aside>

      {/*  Content area ----------------------------------------------------------------------------- */}
      {/* children is whatever page is currently active inside /dashboard */}
      <div className="flex-1 overflow-auto px-8 py-8">
        {children}
      </div>
    </div>
  );
}
