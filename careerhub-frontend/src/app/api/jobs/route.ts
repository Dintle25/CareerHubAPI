import { NextResponse } from "next/server";
import { JobListing } from "@/types";

// Mock job listings 
// Create a list of mock jobs.
// This acts like a fake database until a real backend is connected.
const jobs: JobListing[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Frontend Developer",
    company: "CareerHub",
    location: "Remote",
    type: "FullTime",
    salaryMin: 45000,
    salaryMax: 65000,
    postedAt: "2026-06-17T09:00:00Z",
    isActive: true,
    applicationCount: 12,
  },
  {
    id: "223e4567-e89b-12d3-a456-426614174001",
    title: ".NET Developer",
    company: "Tech Solutions",
    location: "Johannesburg",
    type: "FullTime",
    salaryMin: 35000,
    salaryMax: 55000,
    postedAt: "2026-06-10T08:30:00Z",
    isActive: true,
    applicationCount: 8,
  },
  {
    id: "323e4567-e89b-12d3-a456-426614174002",
    title: "QA Tester",
    company: "Quality First",
    location: "Johannesburg",
    type: "PartTime",
    salaryMin: 18000,
    salaryMax: 25000,
    postedAt: "2026-06-14T11:15:00Z",
    isActive: true,
    applicationCount: 5,
  },
  {
    id: "423e4567-e89b-12d3-a456-426614174003",
    title: "Cloud Engineer",
    company: "CloudTech",
    location: "Pretoria",
    type: "Contract",
    salaryMin: 45000,
    salaryMax: 70000,
    postedAt: "2026-06-05T14:00:00Z",
    isActive: true,
    applicationCount: 3,
  },
  {
    id: "523e4567-e89b-12d3-a456-426614174004",
    title: "Backend Intern",
    company: "Tech Solutions",
    location: "Johannesburg",
    type: "Internship",
    salaryMin: 8000,
    salaryMax: 12000,
    postedAt: "2026-06-12T10:00:00Z",
    isActive: true,
    applicationCount: 20,
  },
  {
    id: "623e4567-e89b-12d3-a456-426614174005",
    title: "Database Administrator",
    company: "Data Systems",
    location: "Durban",
    type: "FullTime",
    salaryMin: 40000,
    salaryMax: 60000,
    postedAt: "2026-05-20T09:00:00Z",
    isActive: false,
    applicationCount: 14,
  },
  {
    id: "723e4567-e89b-12d3-a456-426614174006",
    title: "Senior QA Tester",
    company: "Quality First",
    location: "Johannesburg",
    type: "FullTime",
    salaryMin: 30000,
    salaryMax: 42000,
    postedAt: "2026-05-12T09:00:00Z",
    isActive: false,
    applicationCount: 9,
  },
];

// Only GET is exported, so Next.js automatically returns 405 for any
// other HTTP method on this route — no extra handling needed.
export async function GET() {
   // Return the jobs array as a JSON response
  return NextResponse.json(jobs);
}
