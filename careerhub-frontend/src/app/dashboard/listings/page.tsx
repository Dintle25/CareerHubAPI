// Dashboard listings page — no data fetching here.
// Renders the heading, toolbar, and summary immediately.
// ListingsWrapper (Client Component) reads from Zustand and passes
// view/showClosedJobs props to ListingsTable (async Server Component).

import { Suspense } from "react";
import ApplicationsSummary, { ApplicationsSummarySkeleton } from "@/components/ApplicationsSummary";
import ListingsWrapper from "@/components/ListingsWrapper";
import DashboardToolbar from "@/components/DashboardToolbar";
import ListingsTable, { ListingsTableSkeleton } from "@/components/ListingsTable";

export default async function DashboardListingsPage() {
  return (
    <main>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        All Listings
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Employer overview — live application data
      </p>

      {/* Total applications stat card */}
      <div className="mt-6">
        <Suspense fallback={<ApplicationsSummarySkeleton />}>
          <ApplicationsSummary />
        </Suspense>
      </div>

      {/* Toolbar — view toggle and show closed jobs checkbox */}
      <div className="mt-6">
        <DashboardToolbar />
      </div>

     {/* ListingsTable fetches data and passes it to ListingsWrapper */}
<Suspense fallback={<ListingsTableSkeleton />}>
  <ListingsTable />
</Suspense>
    </main>
  );
}