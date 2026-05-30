# JobBoardApi

A simple .NET 10 Web API that shows job listings. It uses Controllers

## Architecture

This project uses Controller-based architecture with clear routing.

### Why I Used Controllers?

- It allows me to use explicit attribute routing as required ([Route], [HttpGet])
- It keeps the code clean and organized
- It makes it easy to add features later
- It follows the standard way of building Web APIs in .NET

## Key Features

- All endpoints are asynchronous (async)
- Returns correct status codes (200 OK and 404 Not Found)
- Data is stored in a separate file (JobStore) to keep the code clean
- Uses only in-memory data (no database)
- Supports Scalar UI for testing

PostedAt and IsActive represent internal system information that should not be manipulated or faked by the client.

## DTO Layer Decision

I used Data Annotations for most validations because they are clean and built-in. For the custom rule (SalaryMax must be greater than SalaryMin), I chose to add manual validation in the controller because it keeps the DTOs simple and readable


## Extra Explanations

### Why PostedAt is in JobResponse but not in CreateJobRequest
PostedAt shows when the job was created. I put it in JobResponse so clients can see how old the job is. I did not put it in CreateJobRequest because the server should set the time itself. The client should not be allowed to choose the posted date.

### Salary Cross-Field Validation
I used manual validation in the controller for checking that SalaryMax is greater than SalaryMin. I chose this approach because Data Annotations cannot check two fields at the same time. This keeps the DTO clean and simple.

### PUT Endpoint - Status Code Choice
I chose to return 200 OK with the updated job data. This is better because the client immediately gets the latest version of the job without making another request.

### DELETE Endpoint - Behaviour for Missing ID
I return 204 No Content even if the job does not exist. This is the best choice for a job board because DELETE should be idempotent. If someone tries to delete the same job twice, the second request should not fail. It makes the API more reliable.


## Controller Thinning

Controller thinning means keeping controllers simple and focused on successful requests.

Instead of returning NotFound() or Conflict() directly, the controller throws custom exceptions such as JobNotFoundException and DuplicateJobListingException.

The GlobalExceptionHandler catches these exceptions and returns the correct HTTP response. This makes the controller easier to read, easier to maintain, and keeps error handling in one place.

## Structured Logging

Serilog is used to create structured logs for the application.

Structured logging is better than using Console.WriteLine() because it records important information such as the HTTP method, request path, status code, response time, and exception details in a consistent format.

This makes it easier to monitor the application, find errors, and troubleshoot problems in production environments.



## Endpoints

| Method | Endpoint         | Description                    | Status Codes     |
|--------|------------------|--------------------------------|------------------|
| GET    | /api/jobs        | Get all job listings           | 200 OK           |
| GET    | /api/jobs/{id}   | Get one job by ID              | 200 OK / 404     |

## Testing

You can test the API using Scalar UI in your browser:

1. Run the project using `dotnet run`
2. Open your browser and go to: `https://localhost:5076/scalar/v1`
3. Test both endpoints there
