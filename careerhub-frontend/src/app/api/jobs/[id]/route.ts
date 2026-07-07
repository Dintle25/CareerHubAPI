// Route handler for a single job at /api/jobs/[id].
// GET returns the job, PATCH updates its status, POST returns 405.
// Imports from shared mock data so all routes stay in sync.

import { NextRequest, NextResponse } from "next/server";
import { JOBS } from "@/app/api/data/mockJobs";

// GET /api/jobs/[id] — return one job by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === id);

  if (!job) {
    return NextResponse.json(
      { title: "Job Not Found", detail: `No job with id "${id}" exists.`, status: 404 },
      { status: 404 }
    );
  }

  return NextResponse.json(job, { status: 200 });
}

// PATCH /api/jobs/[id] — update job status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Find the job — return 404 if it doesn't exist
  const index = JOBS.findIndex((j) => j.id === id);
  if (index === -1) {
    return NextResponse.json(
      { title: "Job Not Found", detail: `No job with id "${id}" exists.`, status: 404 },
      { status: 404 }
    );
  }

  // Parse the request body — return 400 if status is missing
  const body = await req.json().catch(() => ({}));
  if (!body.status) {
    return NextResponse.json(
      { title: "Bad Request", detail: "Request body must include a 'status' field.", status: 400 },
      { status: 400 }
    );
  }

  // Update status in the mutable array — persists for the server process lifetime
  JOBS[index] = { ...JOBS[index], status: body.status };

  return NextResponse.json(JOBS[index], { status: 200 });
}

// POST — not allowed on this route
export async function POST() {
  return NextResponse.json(
    { title: "Method Not Allowed", detail: "This endpoint only accepts GET and PATCH requests.", status: 405 },
    { status: 405, headers: { Allow: "GET, PATCH" } }
  );
}
