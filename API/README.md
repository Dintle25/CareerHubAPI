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


## N+1 Problem

Before fixing the loading strategy, the terminal showed multiple SQL queries when loading jobs and their related company information. One query loaded the jobs, and additional queries loaded the related companies.

After fixing the loading strategy with eager loading, only one SQL query was executed. The query used a JOIN to load the required data at the same time.

The unfixed version is dangerous in production because the number of database queries grows as more records are returned. This can slow down the application and put unnecessary load on the database.


## Read vs Write Queries

A GET endpoint only reads data and does not make changes. For these queries, I used AsNoTracking() because EF Core does not need to track changes. This improves performance and uses less memory.

A write operation such as PUT or DELETE should use change tracking because EF Core needs to detect changes and save them to the database.

If AsNoTracking() is used when loading an entity for an update, EF Core will not track the changes made to that entity. SaveChangesAsync() may complete successfully, but the updates will not be written to the database, causing a silent data loss bug.


# Assignment 2.3
# Part 1 – Architecture Decisions

## 1. Boundary Decisions

I chose to use separate repositories for each main entity:

* JobRepository
* CompanyRepository
* ApplicationRepository

This keeps each repository responsible for one part of the system and makes the code easier to maintain.

When the ApplicationService creates a new application, it must first check whether the job exists. That validation is performed by calling the JobRepository because the JobRepository owns all job-related data. The ApplicationRepository should only manage application data and should not be responsible for job queries.

If repositories access data that belongs to other repositories, responsibilities become unclear and the code becomes harder to maintain.

## 2. Return Types

Repository methods should not return IQueryable<T>.

Returning IQueryable<T> exposes database query details to the service layer and breaks the repository abstraction. The service layer would need knowledge of Entity Framework and LINQ query construction, which should remain inside the repository.

Instead, repositories should return completed results such as entities or collections. This keeps the service layer independent from the data access technology.

## 3. Lifetime Choices

## CareerHubDbContext – Scoped

A DbContext should be Scoped so that each HTTP request gets its own instance.

If it is Singleton, multiple requests would share the same DbContext, which can cause data corruption and threading problems.

If it is Transient, multiple DbContext instances could be created during one request, making tracking and saving changes difficult.

## JobListingService – Scoped

The service works with the DbContext and should therefore use the same lifetime.

If it is Singleton, it may try to use a DbContext that has already been disposed.

## ApplicationRepository – Scoped

The repository depends on the DbContext and should use the same lifetime.

Using Singleton could lead to database and threading issues.

## ApplicationStatusCache – Singleton

The cache stores status transition rules in memory and does not depend on request-specific data.

Using Singleton allows the same cached data to be shared by the whole application.

Using Scoped or Transient would create unnecessary copies and waste memory.

## 4. Status Transitions

Status transition validation belongs in the Service layer.

The service layer contains the business rules of the application. It can check whether a transition is valid before updating the application.

Putting this validation in the Controller is not ideal because controllers should only handle HTTP requests and responses. Business rules would become duplicated if multiple controllers need the same validation.

Putting this validation in the Repository is also incorrect because repositories should only handle database operations. They should not contain business logic.

The Service layer is the correct place because it sits between the controller and repository and is responsible for enforcing business rules consistently.


# CareerHub API — DI Registration

## How services are registered

All services and repositories are registered in one file:
`Infrastructure/ServiceCollectionExtensions.cs`

`Program.cs` calls a single method:

builder.Services.AddCareerHubServices();


Program.cs does not contain a single `AddScoped`, `AddTransient`, or
AddSingleton call for any application service or repository.


`ValidateOnBuild = true` means the app inspects the entire dependency graph
the moment it starts. If anything is wrong, it refuses to start and prints
exactly which service is misconfigured.


## Lifetime mismatch experiment

### Step 1 — Introduce the mismatch

In `Infrastructure/ServiceCollectionExtensions.cs`, the `AddJobServices`
method was temporarily changed to register `JobService` as a **singleton**
while `IJobRepository` (which wraps a scoped `DbContext`) remained scoped:


### Step 2 — The error at startup

When the app tried to start, it printed this error and immediately stopped:

```
System.AggregateException: Some services are not able to be constructed
(Error while validating the service descriptor
'ServiceType: API.Services.IJobService Lifetime: Singleton
ImplementationType: API.Services.JobService':
Cannot consume scoped service 'API.Repositories.IJobRepository'
from singleton 'API.Services.IJobService'.)
```

The app did not start. No requests were served.

### Why this is a problem

A singleton lives for the entire lifetime of the app.
A scoped service lives only for one HTTP request.
If a singleton holds a reference to a scoped service, that scoped service
gets stuck alive for the whole app lifetime — it never gets cleaned up.
This causes stale database connections and unpredictable bugs.

### Step 3 — The fix

Change `AddSingleton` back to `AddScoped`:


The app started normally after this change.


## Rule: nothing in Program.cs

`Program.cs` is only allowed to call the top-level extension methods.
Any new service you add goes into `ServiceCollectionExtensions.cs` under
the right feature area (or a new one if needed). This keeps `Program.cs`
short and makes it easy to see all registrations in one place.

## Controller Line Count
Both controllers use constructor injection via primary constructors and
delegate everything to the service layer. Every action is at most five
lines: one to call the service, one to return the result.


# Assignment 2.4 – Written Decisions

## 1. Constraint Placement

The service layer checks that SalaryMin is less than SalaryMax before a job listing is created or updated. However, this validation can be bypassed if someone inserts data directly into the database, runs a migration script, or if there is a bug in the application.

Without a database constraint, invalid salary data could be stored. For example, a job listing could have a minimum salary of R50,000 and a maximum salary of R30,000. This would make the data incorrect and unreliable.

A database check constraint ensures that the rule is always enforced, even when data does not come through the API.

## 2. Index Column Ordering

### Active Listings Query

Query:

```sql
WHERE Status = 'Active' AND ExpiresAt < @threshold
```

I put **Status** first and **ExpiresAt** second in the index.

PostgreSQL uses the leftmost column of a composite index first. Since every query filters by Status, placing it first helps PostgreSQL find active records before checking the expiry date.

### Company Listings Query

Query:

```sql
WHERE CompanyId = X AND Status = 'Active'
```

I put **CompanyId** first and **Status** second.

The query always filters by CompanyId, so PostgreSQL can quickly locate records for a specific company before filtering by status.

If a query only filters on a non-leftmost column, PostgreSQL may not be able to use the index efficiently and may perform a table scan instead.

## 3. Identifying Hot Paths

### GetActiveListingsAsync()

This method is a hot path because it is called every time users open the job listings page. Many users can request this data at the same time, so improving its performance has a large impact.

### HasAppliedAsync()

This method is a hot path because it runs every time someone submits a job application. It checks whether the applicant has already applied. Since application submissions happen frequently, reducing its overhead is important.

## 4. FromSql Scope

The statistics query uses PostgreSQL's **RANK() window function**.

EF Core cannot easily translate this query from LINQ because it requires ranking rows based on application counts while also returning grouped statistics.

Using raw SQL with FromSql allows PostgreSQL to execute the RANK() function directly and return the required results efficiently.




## Testing


You can test the API using Scalar UI in your browser:

1. Run the project using `dotnet run`
2. Open your browser and go to: `https://localhost:5076/scalar/v1`
3. Test both endpoints there
