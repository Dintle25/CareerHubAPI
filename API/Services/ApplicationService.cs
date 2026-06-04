using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class ApplicationService : IApplicationService
{
    private readonly CareerHubDbContext _context;

    public ApplicationService(CareerHubDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ApplicationResponse>> GetAllAsync()
{
    return await _context.Applications
        .AsNoTracking()
        .Include(a => a.Applicant)
        .Include(a => a.Job)
        .Select(a => new ApplicationResponse
        {
            ApplicantId = a.ApplicantId,
            JobId = a.JobId,
            AppliedAt = a.AppliedAt,
            Status = a.Status,
            ApplicantName =
                a.Applicant.FirstName + " " + a.Applicant.LastName,
            JobTitle = a.Job.Title
        })
        .ToListAsync();
}

public async Task<ApplicationResponse?> GetByIdAsync(
    Guid applicantId,
    Guid jobId)
{
    return await _context.Applications
        .AsNoTracking()
        .Where(a =>
            a.ApplicantId == applicantId &&
            a.JobId == jobId)
        .Select(a => new ApplicationResponse
        {
            ApplicantId = a.ApplicantId,
            JobId = a.JobId,
            AppliedAt = a.AppliedAt,
            Status = a.Status,
            ApplicantName =
                a.Applicant.FirstName + " " + a.Applicant.LastName,
            JobTitle = a.Job.Title
        })
        .FirstOrDefaultAsync();
}

    public async Task<ApplicationResponse> CreateAsync(
        CreateApplicationRequest request)
    {
        var applicant =
            await _context.Applicants.FindAsync(
                request.ApplicantId);

        if (applicant == null)
            throw new Exception(
                "Applicant does not exist.");

        var job =
            await _context.Jobs.FindAsync(
                request.JobId);

        if (job == null)
            throw new Exception(
                "Job does not exist.");

        var exists =
            await _context.Applications.AnyAsync(a =>
                a.ApplicantId == request.ApplicantId &&
                a.JobId == request.JobId);

        if (exists)
            throw new Exception(
                "Applicant already applied.");

        var application = new Application
        {
            ApplicantId = request.ApplicantId,
            JobId = request.JobId,
            AppliedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Submitted
        };

        _context.Applications.Add(application);

        await _context.SaveChangesAsync();

        return new ApplicationResponse
        {
            ApplicantId = application.ApplicantId,
            JobId = application.JobId,
            AppliedAt = application.AppliedAt,
            Status = application.Status,
            ApplicantName =
                $"{applicant.FirstName} {applicant.LastName}",
            JobTitle = job.Title
        };
    }
}