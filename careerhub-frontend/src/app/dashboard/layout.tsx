// Dashboard layout — wraps every page inside /dashboard with a sidebar.
// Server Component — no state or interactivity needed here.

import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar — stays visible on all dashboard pages */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 px-4 py-8 dark:border-gray-700 dark:bg-gray-900">
        <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Employer Dashboard
        </p>

        <nav className="flex flex-col gap-2">
          {/* All job listings */}
          <Link href="/dashboard/listings" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
            All Listings
          </Link>

          {/* Create a new listing */}
          <Link href="/dashboard/listings/new" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
            + New Listing
          </Link>

          {/* View all applicants across all listings — employer only */}
          <Link href="/dashboard/applicants" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
            All Applicants
          </Link>

          {/* See what candidates see */}
          <Link href="/jobs" className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700">
            View as Candidate
          </Link>
        </nav>
      </aside>

      {/* Page content */}
      <div className="flex-1 overflow-auto px-8 py-8">
        {children}
      </div>
    </div>
  );
}