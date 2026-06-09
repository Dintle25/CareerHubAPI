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
            .Include(a => a.Applicant)
            .Include(a => a.Job)
            .Select(a => new ApplicationResponse
            {
                ApplicantId = a.ApplicantId,
                JobId = a.JobId,
                AppliedAt = a.AppliedAt,
                Status = a.Status,
                ApplicantName = a.Applicant.FirstName + " " + a.Applicant.LastName,
                JobTitle = a.Job.Title
            })
            .ToListAsync();
    }

    public async Task<Application?> GetApplicationAsync(Guid applicantId, Guid jobId)
    {
        return await context.Applications
            .Include(a => a.Applicant)
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a =>
                a.ApplicantId == applicantId &&
                a.JobId == jobId);
    }

    public async Task<bool> HasApplicantAppliedAsync(Guid applicantId, Guid jobId)
    {
        return await context.Applications.AnyAsync(a =>
            a.ApplicantId == applicantId &&
            a.JobId == jobId);
    }

    public async Task<IEnumerable<Application>> GetApplicationsForListingAsync(Guid jobId)
    {
        return await context.Applications
            .AsNoTracking()
            .Include(a => a.Applicant)
            .Where(a => a.JobId == jobId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Application>> GetApplicationsByApplicantAsync(Guid applicantId)
    {
        return await context.Applications
            .AsNoTracking()
            .Include(a => a.Job)
            .Where(a => a.ApplicantId == applicantId)
            .ToListAsync();
    }

    public async Task UpdateAsync(Application application)
    {
        context.Applications.Update(application);
        await context.SaveChangesAsync();
    }

    public async Task<Application?> GetByIdAsync(Guid id)
{
    return await context.Applications
        .Include(a => a.Applicant)
        .Include(a => a.Job)
        .FirstOrDefaultAsync(a => a.Id == id);
}

    // Renamed from AddApplicationAsync → AddAsync to match IApplicationRepository
    public async Task AddAsync(Application application)
    {
        context.Applications.Add(application);
        await context.SaveChangesAsync();
    }

    public async Task<Application?> UpdateApplicationStatusAsync(
        Guid applicantId,
        Guid jobId,
        ApplicationStatus status)
    {
        var app = await context.Applications
            .Include(a => a.Applicant)
            .Include(a => a.Job)
            .FirstOrDefaultAsync(a =>
                a.ApplicantId == applicantId &&
                a.JobId == jobId);

        if (app is null) return null;

        app.Status = status;
        await context.SaveChangesAsync();

        return app;
    }

    // Renamed from DeleteApplicationAsync → DeleteAsync, returns bool
    public async Task<bool> DeleteAsync(Guid applicantId, Guid jobId)
    {
        var app = await context.Applications
            .FirstOrDefaultAsync(a =>
                a.ApplicantId == applicantId &&
                a.JobId == jobId);

        if (app is null) return false;

        context.Applications.Remove(app);
        await context.SaveChangesAsync();

        return true;
    }
}