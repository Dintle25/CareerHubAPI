
//  Generated DTO types 
// Imported from api.generated.ts — do not hand-edit these.
// Run: npm run generate:types to regenerate.

import type { components } from "./api.generated";

// Job type enum from the backend
export type JobType = "FullTime" | "PartTime" | "Contract" | "Internship";

// Job listing — generated type has optional fields so we make required ones explicit
// The generated JobResponse has most fields as optional (string | undefined)
// We keep a stricter frontend type that matches what the API actually returns
export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salaryMin: number;
  salaryMax: number;
  salaryDisplay?: string;
  postedAt: string;
  closingDate?: string;
  isActive: boolean;
  applicationCount: number;
  description?: string;
}

// Application request — use generated type
export type ApplicationRequest = components["schemas"]["CreateApplicationRequest"];

// Application response — generated type uses ApplicationStatus not ApplicationResponse
// Keep hand-written since the generated schema name differs
export interface ApplicationResponse {
  id: string;
  jobId: string;
  email: string;
  submittedAt: string;
}

//  Frontend-only types -----------------------------------------------------------------------------------------
// Not mirrors of backend DTOs — frontend form state and UI shapes only.

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










// //  Generated DTO types 
// // These types are imported from the generated file (src/types/api.generated.ts)
// // which was created by running: npm run generate:types
// // Do not hand-edit these — run the generator instead to keep them in sync.

// import type { components } from "./api.generated";

// // Job listing shape from the backend JobResponse DTO
// export type JobListing = components["schemas"]["JobResponse"];

// // Job type enum from the backend
// export type JobType = components["schemas"]["JobType"];

// // Application request shape sent to the backend
// export type ApplicationRequest = components["schemas"]["CreateApplicationRequest"];

// // Application response shape returned by the backend
// export type ApplicationResponse = components["schemas"]["ApplicationResponse"];

// // ── Frontend-only types ───────────────────────────────────────────────────────
// // These types are not mirrors of backend DTOs — they are frontend-only shapes
// // for form state, UI props, and component interfaces. Keep them here.

// // Shape of the auth register request (sent to /api/v1/auth/register)
// export interface RegisterRequest {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
// }

// // Shape of the auth login request (sent to /api/v1/auth/login)
// export interface LoginRequest {
//   email: string;
//   password: string;
// }

// // Shape of the auth response returned after login or register
// export interface AuthResponse {
//   token: string;
//   email: string;
//   firstName: string;
// }