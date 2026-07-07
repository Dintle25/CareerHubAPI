"use client";

// Small Client Component that resets all nuqs filter params to their defaults.
// Separated from the Server Component page so we can use useQueryStates here.

import { useQueryStates, parseAsString } from "nuqs";

export default function ClearFiltersButton() {
  const [, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    location: parseAsString.withDefault(""),
    status: parseAsString.withDefault("all"),
  },
{ shallow: false });

  return (
    <button
      onClick={() => setFilters({ q: "", location: "", status: "all" })}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
    >
      Clear all filters
    </button>
  );
}