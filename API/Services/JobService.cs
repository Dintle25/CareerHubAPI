// using API.DTOs;
// using API.Exceptions;
// using API.Models;
// using API.Repositories;
 
// namespace API.Services;
 
// /// <summary>
// /// Enforces all job-listing business rules.
// /// No EF Core imports — all data access is delegated to IJobRepository
// /// and ICompanyRepository.
// /// </summary>
// public class JobService(
//     IJobRepository jobRepository,
//     ICompanyRepository companyRepository
// ) : IJobService
// {
//     public async Task<IEnumerable<JobResponse>> GetActiveListingsAsync()
//     {
//         return await jobRepository.GetActiveListingsAsync();
//     }
 
//     public async Task<JobResponse?> GetByIdAsync(Guid jobId)
//     {
//         var job = await jobRepository.GetListingWithDetailsAsync(jobId);
 
//         if (job is null)
//             return null;
 
//         return MapToResponse(job);
//     }
 
//     public async Task<JobResponse> CreateAsync(CreateJobRequest request)
//     {
//         // Rule: company must exist
//         var company = await companyRepository.GetByIdAsync(request.CompanyId)
//             ?? throw new CompanyNotFoundException(request.CompanyId);
 
//         // Rule: closing date must be in the future
//         if (request.ClosingDate <= DateTime.UtcNow)
//             throw new ListingClosedException(
//                 "The closing date must be a future date.");
 
//         var job = new Job
//         {
//             Id = Guid.NewGuid(),
//             Title = request.Title,
//             Description = request.Description,
//             CompanyId = request.CompanyId,
//             Company = company,
//             Location = request.Location,
//             Type = request.Type,
//             ClosingDate = request.ClosingDate,
//             PostedAt = DateTime.UtcNow,
//             IsActive = true
//         };
 
//         await jobRepository.AddListingAsync(job);
 
//         return MapToResponse(job);
//     }
 
//     public async Task<JobResponse> UpdateAsync(Guid jobId, UpdateJobRequest request)
//     {
//         var existing = await jobRepository.GetListingWithDetailsAsync(jobId)
//             ?? throw new JobNotFoundException(jobId);
 
//         // Rule: only the owning company can update the listing
//         if (existing.CompanyId != request.CompanyId)
//             throw new UnauthorizedListingUpdateException();
 
//         // Rule: cannot update a closed listing
//         if (!existing.IsActive || existing.ClosingDate <= DateTime.UtcNow)
//             throw new ListingClosedException(
//                 "Cannot update a listing that is already closed.");
 
//         existing.Title = request.Title;
//         existing.Description = request.Description;
//         existing.Location = request.Location;
//         existing.Type = request.Type;
//         existing.ClosingDate = request.ClosingDate;
 
//         await jobRepository.UpdateListingAsync(existing);
 
//         return MapToResponse(existing);
//     }
 
//     public async Task CloseAsync(Guid jobId)
//     {
//         var existing = await jobRepository.GetListingWithDetailsAsync(jobId)
//             ?? throw new JobNotFoundException(jobId);
 
//         await jobRepository.CloseListingAsync(existing.Id);
//     }
 
//     // ---------------------------------------------------------------------------
//     // Private helpers
//     // ---------------------------------------------------------------------------
 
//     private static JobResponse MapToResponse(Job job) => new()
//     {
//         Id = job.Id,
//         Title = job.Title,
//         Description = job.Description,
//         Company = job.Company?.Name ?? string.Empty,
//         Location = job.Location,
//         Type = job.Type,
//         ClosingDate = job.ClosingDate,
//         PostedAt = job.PostedAt,
//         IsActive = job.IsActive,
//         SalaryDisplay = "N/A",
//         ApplicationCount = job.Applications?.Count ?? 0
//     };
// }

using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;

namespace API.Services;

public class JobService(
    IJobRepository jobRepository,
    ICompanyRepository companyRepository
) : IJobService
{
    public async Task<IEnumerable<JobResponse>> GetActiveListingsAsync()
    {
        return await jobRepository.GetActiveListingsAsync();
    }

    public async Task<JobResponse?> GetByIdAsync(Guid jobId)
    {
        var job = await jobRepository.GetListingWithDetailsAsync(jobId);
        return job is null ? null : MapToResponse(job);
    }

    public async Task<JobResponse> CreateAsync(CreateJobRequest request)
    {
        // Rule: company must exist
        var company = await companyRepository.GetByIdAsync(request.CompanyId)
            ?? throw new CompanyNotFoundException(request.CompanyId);

        // Normalise to UTC before any date comparison or persistence.
        // PostgreSQL 'timestamp with time zone' rejects Kind=Unspecified.
        var closingDateUtc = ToUtc(request.ClosingDate);

        // Rule: closing date must be in the future
        if (closingDateUtc <= DateTime.UtcNow)
            throw new ListingClosedException("The closing date must be a future date.");

        var job = new Job
        {
            Id          = Guid.NewGuid(),
            Title       = request.Title,
            Description = request.Description,
            CompanyId   = request.CompanyId,
            Location    = request.Location,
            Type        = request.Type,
            ClosingDate = closingDateUtc,
            PostedAt    = DateTime.UtcNow,
            IsActive    = true
        };

        await jobRepository.AddListingAsync(job);

        return new JobResponse
        {
            Id             = job.Id,
            Title          = job.Title,
            Description    = job.Description,
            Company        = company.Name,
            Location       = job.Location,
            Type           = job.Type,
            ClosingDate    = job.ClosingDate,
            PostedAt       = job.PostedAt,
            IsActive       = job.IsActive,
            SalaryDisplay  = "N/A",
            ApplicationCount = 0
        };
    }

    public async Task<JobResponse> UpdateAsync(Guid jobId, UpdateJobRequest request)
    {
        var existing = await jobRepository.GetListingWithDetailsAsync(jobId)
            ?? throw new JobNotFoundException(jobId);

        // Rule: only the owning company can update the listing
        if (existing.CompanyId != request.CompanyId)
            throw new UnauthorizedListingUpdateException();

        // Rule: cannot update a closed listing
        if (!existing.IsActive || existing.ClosingDate <= DateTime.UtcNow)
            throw new ListingClosedException("Cannot update a listing that is already closed.");

        existing.Title       = request.Title;
        existing.Description = request.Description;
        existing.Location    = request.Location;
        existing.Type        = request.Type;
        existing.ClosingDate = ToUtc(request.ClosingDate);

        await jobRepository.UpdateListingAsync(existing);

        return MapToResponse(existing);
    }

    public async Task CloseAsync(Guid jobId)
    {
        var existing = await jobRepository.GetListingWithDetailsAsync(jobId)
            ?? throw new JobNotFoundException(jobId);

        await jobRepository.CloseListingAsync(existing.Id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /// <summary>
    /// PostgreSQL requires DateTimeKind.Utc for 'timestamp with time zone'.
    /// Values arriving from JSON have Kind=Unspecified — this normalises them.
    /// </summary>
    private static DateTime ToUtc(DateTime dt) =>
        dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

    private static JobResponse MapToResponse(Job job) => new()
    {
        Id               = job.Id,
        Title            = job.Title,
        Description      = job.Description,
        Company          = job.Company?.Name ?? string.Empty,
        Location         = job.Location,
        Type             = job.Type,
        ClosingDate      = job.ClosingDate,
        PostedAt         = job.PostedAt,
        IsActive         = job.IsActive,
        SalaryDisplay    = "N/A",
        ApplicationCount = job.Applications?.Count ?? 0
    };
}