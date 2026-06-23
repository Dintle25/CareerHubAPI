export type JobType =
  | "FullTime"
  | "PartTime"
  | "Contract"
  | "Internship";

export interface JobListing {
  id: string; 
  title: string;
  company: string;
  location: string;
  jobType: JobType; 
  salaryMin: number;
  salaryMax: number;
  postedAt: string; // ISO 8601 date
  isActive: boolean;
  applicantCount: number;
}

//a test
const job: JobListing = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Frontend Developer",
  company: "CareerHub",
  location: "Remote",
  jobType: "FullTime",
  salaryMin: 45000,
  salaryMax: 65000,
  postedAt: "2026-06-17T09:00:00Z",
  isActive: true,
  applicantCount: 12,
};

// Shape of the data the user fills in when applying for a job
export interface ApplicationRequest {
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;                // optional
  yearsOfExperience: number;
  coverLetter: string;
  linkedInUrl?: string;          // optional
  availableImmediately: boolean;
  noticePeriodWeeks: number;
}

// Shape of the data the server sends back after a successful submission
export interface ApplicationResponse {
  id: string;
  jobId: string;
  email: string;
  submittedAt: string;           // ISO timestamp string e.g. "2026-06-23T10:00:00.000Z"
}