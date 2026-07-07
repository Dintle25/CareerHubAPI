// Stats endpoint at /api/applications/stats.
// Returns application counts grouped by job ID.
// Imports the shared mock jobs array — no data duplication.

import { NextResponse } from "next/server";
import { JOBS } from "@/app/api/data/mockJobs";

// GET /api/applications/stats
// Returns { jobId, applicationCount }[] — one entry per job.
// Returns an empty array if there are no jobs, never a 404.
export async function GET() {
  const stats = JOBS.map((job) => ({
    jobId: job.id,
    applicationCount: job.applicationCount,
  }));

  return NextResponse.json(stats, { status: 200 });
}

// POST — not allowed on this route
export async function POST() {
  return NextResponse.json(
    { title: "Method Not Allowed", detail: "This endpoint only accepts GET requests.", status: 405 },
    { status: 405, headers: { Allow: "GET" } }
  );
}