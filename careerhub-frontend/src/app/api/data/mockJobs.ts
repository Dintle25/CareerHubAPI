// Shared mock jobs data.
// Imported by /api/jobs/route.ts, /api/jobs/[id]/route.ts, and /api/applications/stats/route.ts.
// Defined here once so there is no duplication across route handlers.
// The array is mutable so PATCH requests can update job status in memory
// for the duration of the server process.

export type JobType = "FullTime" | "PartTime" | "Contract" | "Internship";

export interface MockJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  postedAt: string;
  isActive: boolean;
  applicationCount: number;
  description: string;
  status: "open" | "closed" | "draft";
}

export const JOBS: MockJob[] = [
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
    status: "open",
    description: "Build and maintain high-quality React applications for CareerHub's platform.",
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
    status: "open",
    description: "Develop and maintain .NET backend services and APIs for enterprise clients.",
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
    status: "open",
    description: "Design and execute test plans to ensure software quality across all products.",
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
    status: "open",
    description: "Architect and manage cloud infrastructure on AWS and Azure.",
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
    status: "open",
    description: "Support the backend team building APIs and learning software engineering best practices.",
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
    status: "closed",
    description: "Manage, optimise, and secure relational databases across the organisation.",
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
    status: "closed",
    description: "Lead QA strategy and mentor junior testers across multiple product teams.",
  },
];