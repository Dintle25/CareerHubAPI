// using API.Data;
// using API.Models;
// using Microsoft.EntityFrameworkCore;

// namespace API.Repositories;

// public class ApplicationRepository : IApplicationRepository
// {
//     private readonly CareerHubDbContext _context;

//     public ApplicationRepository(CareerHubDbContext context)
//     {
//         _context = context;
//     }

//     public async Task<bool> HasApplicantAppliedAsync(
//         Guid applicantId,
//         Guid jobId)
//     {
//         return await _context.Applications.AnyAsync(a =>
//             a.ApplicantId == applicantId &&
//             a.JobId == jobId);
//     }

//     public async Task<Application?> GetApplicationAsync(
//     Guid applicantId,
//     Guid jobId)
//     {
//         return await _context.Applications
//             .FirstOrDefaultAsync(a =>
//                 a.ApplicantId == applicantId &&
//                 a.JobId == jobId);
//     }

//     public async Task<IEnumerable<Application>>
//         GetApplicationsForListingAsync(Guid jobId)
//     {
//         return await _context.Applications
//             .AsNoTracking()
//             .Include(a => a.Applicant)
//             .Where(a => a.JobId == jobId)
//             .ToListAsync();
//     }

//     public async Task<IEnumerable<Application>>
//         GetApplicationsByApplicantAsync(Guid applicantId)
//     {
//         return await _context.Applications
//             .AsNoTracking()
//             .Include(a => a.Job)
//             .Where(a => a.ApplicantId == applicantId)
//             .ToListAsync();
//     }

//     public async Task AddApplicationAsync(
//         Application application)
//     {
//         _context.Applications.Add(application);

//         await _context.SaveChangesAsync();
//     }

//     public async Task UpdateApplicationStatusAsync(
//         Guid applicantId,
//         Guid jobId,
//         ApplicationStatus status)
//     {
//         var application = await _context.Applications
//             .FindAsync(applicantId, jobId);

//         if (application == null)
//             return;

//         application.Status = status;

//         await _context.SaveChangesAsync();
//     }
    

//    //  clearer + reusable update method
//     public async Task<Application?> UpdateApplicationStatusAsync(
//         Guid applicantId,
//         Guid jobId,
//         ApplicationStatus status)
//     {
//         var application = await _context.Applications
//             .Include(a => a.Applicant)
//             .Include(a => a.Job)
//             .FirstOrDefaultAsync(a =>
//                 a.ApplicantId == applicantId &&
//                 a.JobId == jobId);

//         if (application == null)
//             return null;

//         application.Status = status;

//         await _context.SaveChangesAsync();

//         return application;
//     }

//     // ✅ NEW: delete support (needed for service/controller)
//     public async Task<bool> DeleteApplicationAsync(
//         Guid applicantId,
//         Guid jobId)
//     {
//         var application = await _context.Applications
//             .FirstOrDefaultAsync(a =>
//                 a.ApplicantId == applicantId &&
//                 a.JobId == jobId);

//         if (application == null)
//             return false;

//         _context.Applications.Remove(application);
//         await _context.SaveChangesAsync();

//         return true;
//     }


// }


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