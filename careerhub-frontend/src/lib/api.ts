import { JobListing, JobType, ApplicationRequest, ApplicationResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

//  Helpers --------------------------------------------------------------------------------------------------

/** Reads the JWT from localStorage (set by AuthContext after login). */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ch_token");
}

/** Returns headers with Content-Type and Authorization if a token exists. */
function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

//  Auth types ------------------------------------------------------------------------------------------------

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
}

//  Auth API calls ------------------------------------------------------------------------------------------------

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const problem = await res.json();
    throw new Error(problem.detail ?? problem.title ?? "Registration failed");
  }

  return res.json() as Promise<AuthResponse>;
}

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const problem = await res.json();
    throw new Error(problem.detail ?? problem.title ?? "Invalid email or password");
  }

  return res.json() as Promise<AuthResponse>;
}

//  Jobs -------------------------------------------------------------------------------------------------

interface ApiJobResponse {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: string;
  closingDate: string;
  postedAt: string;
  isActive: boolean;
  salaryDisplay: string;
  salaryMin: number | null;
  salaryMax: number | null;
  applicationCount: number;
}

interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export async function fetchJobs(): Promise<JobListing[]> {
  const res = await fetch(`${BASE_URL}/api/jobs`);

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status} ${res.statusText}`);
  }

  const paged: PagedResponse<ApiJobResponse> = await res.json();

  return paged.data.map((job): JobListing => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type as JobType,
    salaryMin: job.salaryMin ?? 0,
    salaryMax: job.salaryMax ?? 0,
    postedAt: job.postedAt,
    isActive: job.isActive,
    applicationCount: job.applicationCount,
  }));
}

//  Applications ----------------------------------------------------------------------------------------------

export async function submitApplication(
  data: ApplicationRequest
): Promise<ApplicationResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/applications`, {
    method: "POST",
    headers: authHeaders(), // ← attaches Bearer token automatically
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const problem = await res.json();
    throw new Error(problem.detail ?? problem.title ?? "Failed to submit application");
  }

  return res.json() as Promise<ApplicationResponse>;
} 