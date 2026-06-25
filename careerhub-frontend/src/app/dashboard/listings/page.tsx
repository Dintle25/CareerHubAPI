// Dashboard listings page — no data fetching here.
// The heading renders immediately. Each component below streams in independently
// behind its own Suspense boundary as its data resolves.
// Server Component — no "use client" directive.

import { Suspense } from "react";
import ApplicationsSummary, { ApplicationsSummarySkeleton } from "@/components/ApplicationsSummary";
import ListingsTable, { ListingsTableSkeleton } from "@/components/ListingsTable";

export default async function DashboardListingsPage() {
  return (
    <main>
      {/* Heading renders immediately — before either component resolves */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        All Listings
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Employer overview — live application data
      </p>

      {/* ApplicationsSummary streams in first — one fetch, no join, faster */}
      <div className="mt-6">
        <Suspense fallback={<ApplicationsSummarySkeleton />}>
          <ApplicationsSummary />
        </Suspense>
      </div>

      {/* ListingsTable streams in second — two fetches with a join, slightly slower */}
      <Suspense fallback={<ListingsTableSkeleton />}>
        <ListingsTable />
      </Suspense>
    </main>
  );
}








// // Employer listings page at /dashboard/listings.
// // Server Component — fetches jobs and application stats in parallel on the server.
// // No "use client" needed — no state or event handlers here.

// import Link from "next/link";
// import { JobListing } from "@/types";

// interface AppStat {
//   jobId: string;
//   applicationCount: number;
// }

// // Fetches all jobs — cached with the "jobs" tag so revalidateTag("jobs") clears it.
// async function getJobs(): Promise<JobListing[]> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
//     next: { tags: ["jobs"] },
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
//   }

//   const json = await res.json();
//   // Real API wraps the array in { data: [...] }
//   return Array.isArray(json) ? json : json.data ?? json.value ?? [];
// }

// // Fetches application counts grouped by job.
// // Uses cache: "no-store" — applications are submitted at any time so always fetch fresh.
// async function getApplicationStats(): Promise<AppStat[]> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/applications/stats`, {
//     cache: "no-store",
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch stats: ${res.status} ${res.statusText}`);
//   }

//   return res.json();
// }

// export default async function DashboardListingsPage() {
//   // Fetch jobs and stats in parallel — neither waits for the other to finish.
//   // Promise.all fires both requests at the same time, cutting total wait time roughly in half.
//   const [jobs, stats] = await Promise.all([getJobs(), getApplicationStats()]);

//   // Build a lookup map so finding stats by jobId is O(1) instead of O(n) per row
//   const statsMap = new Map(stats.map((s) => [s.jobId, s.applicationCount]));

//   return (
//     <main>
//       <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//         All Listings
//       </h1>

//       {/* Total count shown as a subheading */}
//       <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//         {jobs.length} {jobs.length === 1 ? "listing" : "listings"}
//       </p>

//       {/* Empty state */}
//       {jobs.length === 0 ? (
//         <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
//           <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
//             No listings yet.
//           </p>
//           <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
//             Jobs you post will appear here.
//           </p>
//         </div>
//       ) : (
//         // Data table — compact employer view with application counts
//         <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
//           <table className="w-full text-left text-sm">
//             <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
//               <tr>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Title</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Location</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
//                 {/* Application count joined from the stats endpoint */}
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Applications</th>
//                 <th className="px-4 py-3" />
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//               {jobs.map((job) => (
//                 <tr
//                   key={job.id}
//                   className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
//                 >
//                   <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
//                     {job.title}
//                   </td>
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {job.company}
//                   </td>
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {job.location}
//                   </td>
//                   <td className="px-4 py-3">
//                     {/* Green for active, red for closed */}
//                     <span className={
//                       job.isActive
//                         ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300"
//                         : "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300"
//                     }>
//                       {job.isActive ? "Active" : "Closed"}
//                     </span>
//                   </td>
//                   {/* Look up count by jobId — fall back to 0 if no stat entry exists */}
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {statsMap.get(job.id) ?? 0}
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <Link
//                       href={`/jobs/${job.id}`}
//                       className="text-blue-600 hover:underline dark:text-blue-400"
//                     >
//                       View
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </main>
//   );
// }









// // Employer listings page at /dashboard/listings.
// // Server Component — fetches jobs on the server and renders a data table.
// // No "use client" needed — no state or event handlers here.

// import Link from "next/link";
// import { JobListing } from "@/types";

// // Fetches all jobs from the real API.
// // The API returns { data: [...], totalCount: N, ... } so we unwrap data.
// async function getJobs(): Promise<JobListing[]> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
//     // cache: "no-store", // always fetch fresh data
//     next: { tags: ["jobs"] }, // employer and candidate views cleared together
//   });

//   if (!res.ok) {
//     throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
//   }

//   const json = await res.json();
//   // Real API wraps the array in { data: [...] }
//   return Array.isArray(json) ? json : json.data ?? [];
// }

// export default async function DashboardListingsPage() {
//   const jobs = await getJobs();

//   return (
//     <main>
//       <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//         All Listings
//       </h1>

//       {/* Total count shown as a subheading */}
//       <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//         {jobs.length} {jobs.length === 1 ? "listing" : "listings"}
//       </p>

//       {/* Empty state */}
//       {jobs.length === 0 ? (
//         <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-600">
//           <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
//             No listings yet.
//           </p>
//           <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
//             Jobs you post will appear here.
//           </p>
//         </div>
//       ) : (
//         // Data table — compact employer view
//         <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
//           <table className="w-full text-left text-sm">
//             <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
//               <tr>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Title</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Company</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Location</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Type</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
//                 <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Applications</th>
//                 <th className="px-4 py-3" />
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
//               {jobs.map((job) => (
//                 <tr
//                   key={job.id}
//                   className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
//                 >
//                   <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
//                     {job.title}
//                   </td>
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {job.company}
//                   </td>
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {job.location}
//                   </td>
//                   {/* job.type is the real API field name (was jobType in mock) */}
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {job.type}
//                   </td>
//                   <td className="px-4 py-3">
//                     {/* Green for active, red for closed */}
//                     <span className={
//                       job.isActive
//                         ? "inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900 dark:text-green-300"
//                         : "inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300"
//                     }>
//                       {job.isActive ? "Active" : "Closed"}
//                     </span>
//                   </td>
//                   {/* applicationCount is the real API field name (was applicantCount in mock) */}
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     {job.applicationCount}
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <Link
//                       href={`/jobs/${job.id}`}
//                       className="text-blue-600 hover:underline dark:text-blue-400"
//                     >
//                       View
//                     </Link>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </main>
//   );
// }
