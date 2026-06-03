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


## Authentication and Authorization

### Stateless Authentication

Session-based authentication stores user login information on the server. The server must remember each user's session.

JWT-based authentication stores user information inside a token. The client sends the token with every request, and the server checks if the token is valid.

Stateless authentication is useful when an API runs on multiple servers. Any server can validate the token, so requests do not need to go to the same server every time.

### 401 Unauthorized vs 403 Forbidden

A 401 Unauthorized response means the user is not logged in or did not provide a valid token.

A 403 Forbidden response means the user is logged in, but does not have permission to perform the action.

A 401 response is returned during authentication when the user's identity cannot be verified.

A 403 response is returned during authorization when the user is authenticated but does not have the required role or permissions.

### Token Storage

Storing JWT tokens in localStorage can be risky because JavaScript can access localStorage. If an attacker injects malicious code into the application, they may be able to steal the token.

A safer option is to store tokens in HttpOnly cookies. These cookies cannot be accessed by JavaScript, which helps protect the token from theft.


## Entity Framework Core Notes
1. The Change Tracker

EF Core uses a change tracker to keep track of changes made to objects after they are loaded from the database.

For example, when a job is loaded and its title or description is changed, EF Core remembers those changes. When SaveChangesAsync() is called, EF Core checks what has changed and updates the database.

SaveChangesAsync() is called once at the end of an operation because it is more efficient. Instead of sending a database request for every property change, EF Core saves all changes in a single database operation.

2. Migrations as Version Control

Migration files should always be committed to source control together with the code that created them.

Migrations keep track of changes made to the database structure, such as creating tables, adding columns, or creating indexes.

If a teammate pulls the latest code but does not have the migration file or has not applied the migration, their database structure may not match the application code. This can cause errors when the application tries to access tables or columns that do not exist in their database.

3. Connection String Security

The connection string is stored in appsettings.Development.json because it contains sensitive information such as the database username and password.

It should not be placed in appsettings.json because that file is usually committed to source control and shared with other developers.

In a production environment, a safer approach is to store connection strings in environment variables or a secure secrets management service. This helps keep database credentials private and reduces the risk of exposing them in source control.



# Assignment 2.2 – Relationship Design

## Which relationships are one-to-many and which require a join entity?

A Company can have many Job Listings, but each Job Listing belongs to only one Company. This is a one-to-many relationship.

A Job Listing can receive many Applications, and an Applicant can apply for many Job Listings. This is a many-to-many relationship. To represent this relationship, an Application entity is needed as a join entity between Applicant and Job Listing.

## Why can the application relationship not be represented by a hidden join table?

The Application relationship stores important information about each application. For example, it stores the date the application was submitted and the current application status.

Because the relationship contains its own data, it cannot be represented by a hidden join table. An explicit Application entity is required so that these details can be stored and managed.

## What should happen if a Company is deleted?

A Company should not be deleted if it still has Job Listings linked to it.

Deleting a Company could remove important job information and application history. It is safer to prevent deletion until all related Job Listings have been removed or reassigned.

This helps protect data integrity and prevents accidental data loss.

## Application Status Values

The application status can be represented using a C# enum.

Example values:

* Submitted
* UnderReview
* InterviewScheduled
* Accepted
* Rejected

Using an enum ensures that only valid status values can be used.




## Testing

You can test the API using Scalar UI in your browser:

1. Run the project using `dotnet run`
2. Open your browser and go to: `https://localhost:5076/scalar/v1`
3. Test both endpoints there
