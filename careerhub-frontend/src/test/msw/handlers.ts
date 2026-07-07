// MSW handlers — intercept real HTTP requests made by components during tests.
// Uses the real API URL from env so handlers match what the API client fetches.

import { http, HttpResponse } from "msw";

const API = process.env.NEXT_PUBLIC_API_URL;

export const handlers = [
  // POST /api/v1/applications — happy path: return 201 with a mock response
  http.post(`${API}/api/v1/applications`, () => {
    return HttpResponse.json(
      {
        id: "mock-application-id",
        jobId: "job-1",
        email: "alice@test.com",
        submittedAt: "2026-07-01T00:00:00.000Z",
      },
      { status: 201 }
    );
  }),

  // GET /api/jobs — TanStack Query re-fetches this after a successful submit
  // (invalidateQueries({ queryKey: ["jobs"] }) triggers this)
  http.get(`${API}/api/jobs`, () => {
    return HttpResponse.json({
      data: [
        {
          id: "job-1",
          title: "Frontend Developer",
          company: "CareerHub",
          location: "Remote",
          type: "FullTime",
          isActive: true,
          applicationCount: 1,
          salaryMin: 45000,
          salaryMax: 65000,
          postedAt: "2026-06-01T00:00:00Z",
          description: "Build React apps.",
        },
      ],
    });
  }),

  // GET /api/jobs/:id — single job fetch on the detail page
  http.get(`${API}/api/jobs/:id`, () => {
    return HttpResponse.json({
      id: "job-1",
      title: "Frontend Developer",
      company: "CareerHub",
      location: "Remote",
      type: "FullTime",
      isActive: true,
      applicationCount: 1,
      salaryMin: 45000,
      salaryMax: 65000,
      postedAt: "2026-06-01T00:00:00Z",
      description: "Build React apps.",
    });
  }),

  // DELETE /api/jobs/:id — CloseJobButton calls this via Server Action
  http.delete(`${API}/api/jobs/:id`, () => {
    return HttpResponse.json(
      { id: "job-1", title: "Frontend Developer", isActive: false },
      { status: 200 }
    );
  }),
];