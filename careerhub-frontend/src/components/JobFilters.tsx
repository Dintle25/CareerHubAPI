"use client";

// Client Component — manages the three job filters using nuqs.
// All filter state lives in the URL so filters persist on refresh
// and can be shared by copying the URL.
// Keyword and location are debounced — we wait 300ms after the user
// stops typing before updating the URL to avoid a navigation on every keypress.

import { useQueryStates, parseAsString } from "nuqs";
import { useState, useEffect } from "react";

export default function JobFilters() {
    // All three filters live in the URL via nuqs
    const [filters, setFilters] = useQueryStates({
        q: parseAsString.withDefault(""),
        location: parseAsString.withDefault(""),
        status: parseAsString.withDefault("all"),
    });

    // Local state for debounced inputs — these update on every keystroke
    // but only push to the URL after 300ms of inactivity
    const [keywordInput, setKeywordInput] = useState(filters.q);
    const [locationInput, setLocationInput] = useState(filters.location);

    // Debounce keyword — wait 300ms after typing stops before updating URL
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters({ q: keywordInput });
        }, 300);
        return () => clearTimeout(timer);
    }, [keywordInput]);

    // Debounce location — same pattern as keyword
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters({ location: locationInput });
        }, 300);
        return () => clearTimeout(timer);
    }, [locationInput]);

    return (
        <div className="mb-6 flex flex-wrap gap-3">

            {/* Keyword search — debounced, updates URL after 300ms */}
            <input
                type="text"
                placeholder="Search by keyword…"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                   w-48"
            />

            {/* Location — text input chosen over select because locations are free-form text
          in the real API (e.g. "bloemfontein", "Remote") so a fixed list would miss values.
          Debounced for the same reason as keyword. */}
            <input
                type="text"
                placeholder="Filter by location…"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                   w-48"
            />

            {/* Status toggle — updates immediately, no debounce needed */}
            <label htmlFor="status" className="sr-only">Job status</label>
            <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ status: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm
             focus:outline-none focus:ring-2 focus:ring-blue-500
             dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
                <option value="all">All jobs</option>
                <option value="open">Open only</option>
            </select>

            {/* Clear all filters — resets URL params to defaults */}
            {(filters.q || filters.location || filters.status !== "all") && (
                <button
                    onClick={() => {
                        setKeywordInput("");
                        setLocationInput("");
                        setFilters({ q: "", location: "", status: "all" });
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm
                     text-gray-600 hover:bg-gray-100
                     dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                    Clear
                </button>
            )}
        </div>
    );
}