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
