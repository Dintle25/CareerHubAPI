// export default function Home() {
//   return <h1>CareerHub Frontend is running</h1>;
// }


"use client";

import JobList from "@/crs/components/JobList";
import { JobListing } from "@/crs/types";
import React, { useState } from "react";

export default function Home() {
  // hardcoded dataset with realistic South African jobs: 
  const jobs: JobListing[] = [
    {
      //a job that is posted today
      id: "11111111-aaaa-bbbb-cccc-111111111111",
      title: "Software Engineer",
      company: "Bitcube",
      location: "Johannesburg",
      jobType: "FullTime",
      salaryMin: 45000,
      salaryMax: 65000,
      postedAt: new Date().toISOString(), // posted today
      isActive: true,
      applicantCount: 12,
    },
    {
      //a job that is posted more than 30 days  ago
      id: "22222222-aaaa-bbbb-cccc-222222222222",
      title: "Data Analyst",
      company: "Discovery",
      location: "Cape Town",
      jobType: "Contract",
      salaryMin: 30000,
      salaryMax: 40000,
      postedAt: "2026-05-01T09:00:00Z", // more than 30 days ago
      isActive: true,
      applicantCount: 0, // applicantCount = 0
    },
    {
      //a job listing with isActive = false
      id: "33333333-aaaa-bbbb-cccc-333333333333",
      title: "Marketing Coordinator",
      company: "Shoprite",
      location: "Durban",
      jobType: "PartTime",
      salaryMin: 20000,
      salaryMax: 25000,
      postedAt: "2026-06-10T09:00:00Z",
      isActive: false, // job that is not active
      applicantCount: 5,
    },
    {
      id: "44444444-aaaa-bbbb-cccc-444444444444",
      title: "HR Specialist",
      company: "Sasol",
      location: "Secunda",
      jobType: "FullTime",
      salaryMin: 35000,
      salaryMax: 50000,
      postedAt: "2026-06-15T09:00:00Z",
      isActive: true,
      applicantCount: 8,
    },
    {
      id: "55555555-aaaa-bbbb-cccc-555555555555",
      title: "Frontend Developer",
      company: "Takealot",
      location: "Remote",
      jobType: "Internship",
      salaryMin: 10000,
      salaryMax: 15000,
      postedAt: "2026-06-01T09:00:00Z",
      isActive: true,
      applicantCount: 2,
    },
    {
      //a job that is older that 30 days
      id: "66666666-aaaa-bbbb-cccc-666666666666",
      title: "Project Manager",
      company: "MTN",
      location: "Pretoria",
      jobType: "Contract",
      salaryMin: 50000,
      salaryMax: 70000,
      postedAt: "2026-04-20T09:00:00Z", // older than 30 days
      isActive: true,
      applicantCount: 15,
    },
  ];

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const selectedJob = jobs.find((job) => job.id === selectedId);

  return (
    <main className="p-6">
      {/* the summary panel for only when a job is selected */}
      {selectedJob && (
        <div className="mb-6 p-4 border rounded bg-gray-100">
          <h2 className="text-lg font-bold">{selectedJob.title}</h2>
          <p className="text-gray-700">{selectedJob.company}</p>
        </div>
      )}

      <JobList jobs={jobs} selectedId={selectedId} onSelect={handleSelect} />
    </main>
  );
}
