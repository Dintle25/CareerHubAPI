using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class JobRepository : IJobRepository
{
    private readonly CareerHubDbContext _context;

    public JobRepository(CareerHubDbContext context)
    {
        _context = context;
    }


    public async Task<PagedResponse<JobResponse>> GetActiveListingsPagedAsync(
        JobListingFilterQuery filter,
        int page,
        int pageSize)
    {
        //filtering
        //     var query = _context.Jobs
        //    .Where(j => j.IsActive)
        //    .AsQueryable();

        var query = _context.Jobs
        .AsNoTracking()
        .Include(j => j.Company)
        .Include(j => j.Applications)
        .Where(j => j.IsActive)
        .AsQueryable();

        if (!string.IsNullOrWhiteSpace(filter.Location))
        {
            query = query.Where(j =>
                j.Location.ToLower().Contains(filter.Location.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(filter.EmploymentType))
        {
            // query = query.Where(j =>
            //     j.Type.ToString() == filter.EmploymentType);
            query = query.Where(j =>
            j.Type.ToString().ToLower() == filter.EmploymentType.ToLower());
        }

        if (filter.SalaryMin.HasValue)
        {
            query = query.Where(j =>
                j.SalaryMin >= filter.SalaryMin.Value);
        }

        if (filter.SalaryMax.HasValue)
        {
            query = query.Where(j =>
                j.SalaryMax <= filter.SalaryMax.Value);
        }

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(j =>
                j.CompanyId == filter.CompanyId.Value);
        }


        // var query = _context.Jobs
        //     .Where(j => j.IsActive)
        //     .OrderByDescending(j => j.PostedAt);

        //sorting
        query = (filter.Sort.ToLower(), filter.Dir?.ToLower()) switch
        {
            ("salarymin", "desc") => query.OrderByDescending(j => j.SalaryMin),
            ("salarymin", _) => query.OrderBy(j => j.SalaryMin),

            ("salarymax", "asc") => query.OrderBy(j => j.SalaryMax),
            ("salarymax", _) => query.OrderByDescending(j => j.SalaryMax),

            ("title", "desc") => query.OrderByDescending(j => j.Title),
            ("title", _) => query.OrderBy(j => j.Title),

            ("postedat", "asc") => query.OrderBy(j => j.PostedAt),

            _ => query.OrderByDescending(j => j.PostedAt)
        };


        var totalCount = await query.CountAsync();

        // var items = await query
        //     .Skip((page - 1) * pageSize)
        //     .Take(pageSize)
        //     .Select(j => new JobResponse
        //     {
        //         Id = j.Id,
        //         Title = j.Title,
        //         Description = j.Description
        //     })
        //     .ToListAsync();

        var items = await query
    .Skip((page - 1) * pageSize)
    .Take(pageSize)
    .Select(j => new JobResponse
    {
        Id = j.Id,
        Title = j.Title,
        Description = j.Description,
        Company = j.Company.Name,
        Location = j.Location,
        Type = j.Type,
        ClosingDate = j.ClosingDate,
        PostedAt = j.PostedAt,
        IsActive = j.IsActive,
        //SalaryDisplay = "N/A",
        SalaryDisplay = j.SalaryMin.HasValue && j.SalaryMax.HasValue
    ? $"£{j.SalaryMin} - £{j.SalaryMax}"
    : "Not specified",
        ApplicationCount = j.Applications.Count()
    })
    .ToListAsync();

        var totalPages = (int)Math.Ceiling(
            totalCount / (double)pageSize);

        return new PagedResponse<JobResponse>(
            items,
            page,
            pageSize,
            totalCount,
            totalPages,
            page < totalPages,
            page > 1
        );
    }

    public async Task<Job?> GetListingWithDetailsAsync(Guid jobId)
    {
        return await _context.Jobs
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.Applications)
                .ThenInclude(a => a.Applicant)
            .FirstOrDefaultAsync(j => j.Id == jobId);
    }

    public async Task<Job?> GetEntityByIdAsync(Guid id)
    {
        return await _context.Jobs
            .Include(j => j.Company)
            .Include(j => j.Applications)
            .FirstOrDefaultAsync(j => j.Id == id);
    }

    public async Task<JobResponse> PatchAsync(
    Guid id,
    UpdateJobListingRequest request)
    {
        var job = await GetEntityByIdAsync(id);

        // patch logic goes here
        if (request.Title != null)
            job.Title = request.Title;

        if (request.Description != null)
            job.Description = request.Description;

        if (request.Location != null)
            job.Location = request.Location;

        if (!string.IsNullOrWhiteSpace(request.EmploymentType) &&
       Enum.TryParse<JobType>(
        request.EmploymentType,
        true,
        out var jobType))
        {
            job.Type = jobType;
        }

        // Salary validation starts here

        var newSalaryMin = request.SalaryMin ?? job.SalaryMin;
        var newSalaryMax = request.SalaryMax ?? job.SalaryMax;

        if (request.SalaryMin.HasValue || request.SalaryMax.HasValue)
        {
            if (newSalaryMin > newSalaryMax)
                throw new ArgumentException(
                    "SalaryMin cannot be greater than SalaryMax");
        }

        if (request.SalaryMin.HasValue)
            job.SalaryMin = request.SalaryMin;

        if (request.SalaryMax.HasValue)
            job.SalaryMax = request.SalaryMax;

        if (request.ExpiresAt.HasValue)
        {
            if (request.ExpiresAt <= DateTime.UtcNow)
                throw new ArgumentException(
                    "ExpiresAt must be in the future");

            job.ClosingDate = request.ExpiresAt.Value;
        }

        await _context.SaveChangesAsync();

        return new JobResponse
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            Company = job.Company.Name,
            Location = job.Location,
            Type = job.Type,
            ClosingDate = job.ClosingDate,
            PostedAt = job.PostedAt,
            IsActive = job.IsActive,

            SalaryDisplay =
        job.SalaryMin.HasValue && job.SalaryMax.HasValue
            ? $"£{job.SalaryMin} - £{job.SalaryMax}"
            : "Not specified",

            ApplicationCount = job.Applications.Count
        };
    }

    public async Task<bool> IsListingOpenAsync(Guid jobId)
    {
        return await _context.Jobs.AnyAsync(j =>
            j.Id == jobId &&
            j.IsActive);
    }

    public async Task AddListingAsync(Job job)
    {
        _context.Jobs.Add(job);

        await _context.SaveChangesAsync();
    }

    public async Task UpdateListingAsync(Job job)
    {
        _context.Jobs.Update(job);

        await _context.SaveChangesAsync();
    }

    public async Task CloseListingAsync(Guid jobId)
    {
        var job = await _context.Jobs.FindAsync(jobId);

        if (job == null)
            return;

        job.IsActive = false;

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<JobResponse>>
    GetActiveListingsAsync()
    {
        return await _context.Jobs
            .AsNoTracking()
            .Where(j => j.IsActive)
            .Select(j => new JobResponse
            {
                Id = j.Id,
                Title = j.Title,
                Description = j.Description,
                Company = j.Company.Name,
                Location = j.Location,
                Type = j.Type,
                PostedAt = j.PostedAt,
                IsActive = j.IsActive,

                // SalaryDisplay = "N/A",
                SalaryDisplay = j.SalaryMin.HasValue && j.SalaryMax.HasValue
    ? $"£{j.SalaryMin} - £{j.SalaryMax}"
    : "Not specified",

                // Computed by SQL
                ApplicationCount = j.Applications.Count()
            })
            .ToListAsync();
    }
}