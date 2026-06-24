import { NextRequest, NextResponse } from "next/server";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  status: string;
  description: string;
}

const JOBS: Job[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Frontend Developer",
    company: "CareerHub",
    location: "Remote",
    status: "open",
    description: "Build and maintain high-quality React applications for CareerHub's platform.",
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    title: ".NET Developer",
    company: "Tech Solutions",
    location: "Johannesburg",
    status: "open",
    description: "Develop and maintain .NET backend services and APIs for enterprise clients.",
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    title: "QA Tester",
    company: "Quality First",
    location: "Johannesburg",
    status: "open",
    description: "Design and execute test plans to ensure software quality across all products.",
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    title: "Cloud Engineer",
    company: "CloudTech",
    location: "Pretoria",
    status: "open",
    description: "Architect and manage cloud infrastructure on AWS and Azure.",
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    title: "Backend Intern",
    company: "Tech Solutions",
    location: "Johannesburg",
    status: "open",
    description: "Support the backend team building APIs and learning software engineering best practices.",
  },
  {
    id: "623e4567-e89b-12d3-a456-426614174005",
    title: "Database Administrator",
    company: "Data Systems",
    location: "Durban",
    status: "closed",
    description: "Manage, optimise, and secure relational databases across the organisation.",
  },
  {
    id: "723e4567-e89b-12d3-a456-426614174006",
    title: "Senior QA Tester",
    company: "Quality First",
    location: "Johannesburg",
    status: "closed",
    description: "Lead QA strategy and mentor junior testers across multiple product teams.",
  },
];

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

export async function POST() {
  return NextResponse.json(
    { title: "Method Not Allowed", detail: "This endpoint only accepts GET requests.", status: 405 },
    { status: 405, headers: { Allow: "GET" } }
  );
}