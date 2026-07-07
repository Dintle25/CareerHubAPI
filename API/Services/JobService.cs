// using API.DTOs;
// using API.Exceptions;
// using API.Models;
// using API.Repositories;

// namespace API.Services;

// public class JobService(
//     IJobRepository jobRepository,
//     ICompanyRepository companyRepository
// ) : IJobService
// {

//     public async Task<PagedResponse<JobResponse>> GetActiveListingsPagedAsync(
//     JobListingFilterQuery filter,
//     int page,
//     int pageSize)
//     {
//         return await jobRepository.GetActiveListingsPagedAsync(
//             filter,
//             page,
//             pageSize);
//     }

//     // public async Task<JobResponse> PatchAsync(
//     // Guid id,
//     // UpdateJobListingRequest request)
//     // {
//     //     return await jobRepository.PatchAsync(id, request);
//     // }

//     public async Task<JobResponse> PatchAsync(Guid id, UpdateJobListingRequest request)
//     {
//         var existing = await jobRepository.GetEntityByIdAsync(id)
//             ?? throw new JobNotFoundException(id);

//         if (request.SalaryMin is not null || request.SalaryMax is not null)
//         {
//             var effectiveMin = request.SalaryMin ?? existing.SalaryMin;
//             var effectiveMax = request.SalaryMax ?? existing.SalaryMax;

//             if (effectiveMax < effectiveMin)
//                 throw new InvalidSalaryException();
//         }

//         if (request.Title is not null) existing.Title = request.Title;
//         // ... other nullable fields
//         if (request.Title != null)
//             existing.Title = request.Title;

//         if (request.Description != null)
//             existing.Description = request.Description;

//         if (request.Location != null)
//             existing.Location = request.Location;

//         await jobRepository.UpdateListingAsync(existing);
//         return MapToResponse(existing);
//     }


//     public async Task<IEnumerable<JobResponse>> GetActiveListingsAsync()
//     {
//         return await jobRepository.GetActiveListingsAsync();
//     }

//     public async Task<JobResponse?> GetByIdAsync(Guid jobId)
//     {
//         var job = await jobRepository.GetListingWithDetailsAsync(jobId);
//         return job is null ? null : MapToResponse(job);
//     }

//     public async Task<JobResponse> CreateAsync(CreateJobRequest request)
//     {
//         // Rule: company must exist
//         var company = await companyRepository.GetByIdAsync(request.CompanyId)
//             ?? throw new CompanyNotFoundException(request.CompanyId);

//         var closingDateUtc = ToUtc(request.ClosingDate);

//         // Rule: closing date must be in the future
//         if (closingDateUtc <= DateTime.UtcNow)
//             throw new ListingClosedException("The closing date must be a future date.");

//         if (request.SalaryMin.HasValue &&
//         request.SalaryMax.HasValue &&
//         request.SalaryMin > request.SalaryMax)
//         {
//             throw new InvalidSalaryException();
//         }

//         var job = new Job
//         {
//             Id = Guid.NewGuid(),
//             Title = request.Title,
//             Description = request.Description,
//             CompanyId = request.CompanyId,
//             Location = request.Location,
//             Type = request.Type,
//             SalaryMin = request.SalaryMin,
//             SalaryMax = request.SalaryMax,
//             ClosingDate = closingDateUtc,
//             PostedAt = DateTime.UtcNow,
//             IsActive = true
//         };

//         await jobRepository.AddListingAsync(job);

//         return new JobResponse
//         {
//             Id = job.Id,
//             Title = job.Title,
//             Description = job.Description,
//             Company = company.Name,
//             Location = job.Location,
//             Type = job.Type,
//             ClosingDate = job.ClosingDate,
//             PostedAt = job.PostedAt,
//             IsActive = job.IsActive,
//             SalaryDisplay = "N/A",
//             ApplicationCount = 0
//         };
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
//             throw new ListingClosedException("Cannot update a listing that is already closed.");

//         existing.Title = request.Title;
//         existing.Description = request.Description;
//         existing.Location = request.Location;
//         existing.Type = request.Type;
//         existing.ClosingDate = ToUtc(request.ClosingDate);

//         await jobRepository.UpdateListingAsync(existing);

//         return MapToResponse(existing);
//     }

//     public async Task CloseAsync(Guid jobId)
//     {
//         var existing = await jobRepository.GetListingWithDetailsAsync(jobId)
//             ?? throw new JobNotFoundException(jobId);

//         await jobRepository.CloseListingAsync(existing.Id);
//     }

//     // ── Helpers ─────────────────────────────────────────────────────────────

//     /// <summary>
//     /// PostgreSQL requires DateTimeKind.Utc for 'timestamp with time zone'.
//     /// Values arriving from JSON have Kind=Unspecified — this normalises them.
//     /// </summary>
//     private static DateTime ToUtc(DateTime dt) =>
//         dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

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

    public async Task<PagedResponse<JobResponse>> GetActiveListingsPagedAsync(
    JobListingFilterQuery filter,
    int page,
    int pageSize)
    {
        return await jobRepository.GetActiveListingsPagedAsync(
            filter,
            page,
            pageSize);
    }

    public async Task<JobResponse> PatchAsync(Guid id, UpdateJobListingRequest request)
    {
        var existing = await jobRepository.GetEntityByIdAsync(id)
            ?? throw new JobNotFoundException(id);

        if (request.SalaryMin is not null || request.SalaryMax is not null)
        {
            var effectiveMin = request.SalaryMin ?? existing.SalaryMin;
            var effectiveMax = request.SalaryMax ?? existing.SalaryMax;

            if (effectiveMax < effectiveMin)
                throw new InvalidSalaryException();
        }

        if (request.Title != null)
            existing.Title = request.Title;

        if (request.Description != null)
            existing.Description = request.Description;

        if (request.Location != null)
            existing.Location = request.Location;

        await jobRepository.UpdateListingAsync(existing);
        return MapToResponse(existing);
    }


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

        var closingDateUtc = ToUtc(request.ClosingDate);

        // Rule: closing date must be in the future
        if (closingDateUtc <= DateTime.UtcNow)
            throw new ListingClosedException("The closing date must be a future date.");

        if (request.SalaryMin.HasValue &&
        request.SalaryMax.HasValue &&
        request.SalaryMin > request.SalaryMax)
        {
            throw new InvalidSalaryException();
        }

        var job = new Job
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            CompanyId = request.CompanyId,
            Location = request.Location,
            Type = request.Type,
            SalaryMin = request.SalaryMin,
            SalaryMax = request.SalaryMax,
            ClosingDate = closingDateUtc,
            PostedAt = DateTime.UtcNow,
            IsActive = true
        };

        await jobRepository.AddListingAsync(job);

        return new JobResponse
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            Company = company.Name,
            Location = job.Location,
            Type = job.Type,
            ClosingDate = job.ClosingDate,
            PostedAt = job.PostedAt,
            IsActive = job.IsActive,
            SalaryMin = job.SalaryMin,
            SalaryMax = job.SalaryMax,
            SalaryDisplay = FormatSalary(job.SalaryMin, job.SalaryMax),
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

        existing.Title = request.Title;
        existing.Description = request.Description;
        existing.Location = request.Location;
        existing.Type = request.Type;
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

    //  Helpers ----------------------------------------------------------------------------------------------------

    /// <summary>
    /// PostgreSQL requires DateTimeKind.Utc for 'timestamp with time zone'.
    /// Values arriving from JSON have Kind=Unspecified — this normalises them.
    /// </summary>
    private static DateTime ToUtc(DateTime dt) =>
        dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);

    /// <summary>
    /// Formats salary range as a ZAR string, or "N/A" when both values are absent.
    /// </summary>
    private static string FormatSalary(decimal? min, decimal? max) =>
        (min, max) switch
        {
            (not null, not null) => $"R{min.Value:N0} – R{max.Value:N0} pm",
            (not null, null) => $"From R{min.Value:N0} pm",
            (null, not null) => $"Up to R{max.Value:N0} pm",
            _ => "N/A"
        };

    private static JobResponse MapToResponse(Job job) => new()
    {
        Id = job.Id,
        Title = job.Title,
        Description = job.Description,
        Company = job.Company?.Name ?? string.Empty,
        Location = job.Location,
        Type = job.Type,
        ClosingDate = job.ClosingDate,
        PostedAt = job.PostedAt,
        IsActive = job.IsActive,
        SalaryMin = job.SalaryMin,
        SalaryMax = job.SalaryMax,
        SalaryDisplay = FormatSalary(job.SalaryMin, job.SalaryMax),
        ApplicationCount = job.Applications?.Count ?? 0
    };

    // Returns all jobs including closed ones — used by the employer dashboard
    public async Task<PagedResponse<JobResponse>> GetAllListingsPagedAsync(int page, int pageSize)
    {
        return await jobRepository.GetAllListingsPagedAsync(page, pageSize);
    }
}