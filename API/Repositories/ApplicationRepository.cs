using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class ApplicationRepository(CareerHubDbContext context) : IApplicationRepository
{
    public async Task<IEnumerable<ApplicationResponse>> GetAllAsync()
    {
        return await context.Applications
            .AsNoTracking()
            .Include(a => a.Job)
           .Select(a => new ApplicationResponse
           {
               Id = a.Id,
               JobId = a.JobId,
               Email = a.Email,
               SubmittedAt = a.AppliedAt.ToString("O")
           })
            .ToListAsync();
    }

    public async Task<Application?> GetByIdAsync(Guid id)
    {
        return await context.Applications
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<bool> HasApplicationAsync(string email, Guid jobId)
    {
        return await context.Applications.AnyAsync(a =>
            a.Email == email &&
            a.JobId == jobId);
    }

    public async Task<IEnumerable<Application>> GetApplicationsForListingAsync(Guid jobId)
    {
        return await context.Applications
            .AsNoTracking()
            .Where(a => a.JobId == jobId)
            .ToListAsync();
    }

    public async Task UpdateAsync(Application application)
    {
        context.Applications.Update(application);
        await context.SaveChangesAsync();
    }

    // Renamed from AddApplicationAsync → AddAsync to match IApplicationRepository
    public async Task AddAsync(Application application)
    {
        context.Applications.Add(application);
        await context.SaveChangesAsync();
    }

    public async Task<Application?> UpdateApplicationStatusAsync(
    Guid applicationId,
    ApplicationStatus status)
    {
        var app = await context.Applications
            .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app is null)
            return null;

        app.Status = status;

        await context.SaveChangesAsync();

        return app;
    }

    // Renamed from DeleteApplicationAsync → DeleteAsync, returns bool
    public async Task<bool> DeleteAsync(Guid applicationId)
    {
        var app = await context.Applications
    .FirstOrDefaultAsync(a => a.Id == applicationId);

        if (app is null) return false;

        context.Applications.Remove(app);
        await context.SaveChangesAsync();

        return true;
    }
}