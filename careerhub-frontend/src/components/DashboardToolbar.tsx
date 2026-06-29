"use client";

// Client Component — reads from the Zustand store and renders the toolbar.
// Uses one useStore call per value (not destructuring) as required.
// This is the only place that touches the store — it passes view and
// showClosedJobs down to ListingsTable as props.

import { useDashboardStore } from "@/stores/dashboardStore";

export default function DashboardToolbar() {
  // One selector per value — not destructuring the whole store at once
  const view = useDashboardStore((state) => state.view);
  const setView = useDashboardStore((state) => state.setView);
  const showClosedJobs = useDashboardStore((state) => state.showClosedJobs);
  const toggleShowClosedJobs = useDashboardStore(
    (state) => state.toggleShowClosedJobs
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4">

      {/* View toggle — switches between table and grid layout */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setView("table")}
          className={
            view === "table"
              ? "px-4 py-2 text-sm font-medium bg-blue-600 text-white"
              : "px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }
        >
          Table
        </button>
        <button
          onClick={() => setView("grid")}
          className={
            view === "grid"
              ? "px-4 py-2 text-sm font-medium bg-blue-600 text-white"
              : "px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }
        >
          Grid
        </button>
      </div>

      {/* Show closed jobs checkbox */}
      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
        <input
          type="checkbox"
          checked={showClosedJobs}
          onChange={toggleShowClosedJobs}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Show closed jobs
      </label>
    </div>
  );
}