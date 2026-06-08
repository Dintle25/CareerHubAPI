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

    public async Task<Job?> GetListingWithDetailsAsync(Guid jobId)
    {
        return await _context.Jobs
            .AsNoTracking()
            .Include(j => j.Company)
            .Include(j => j.Applications)
                .ThenInclude(a => a.Applicant)
            .FirstOrDefaultAsync(j => j.Id == jobId);
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

            SalaryDisplay = "N/A",

            // Computed by SQL
            ApplicationCount = j.Applications.Count()
        })
        .ToListAsync();
}
}