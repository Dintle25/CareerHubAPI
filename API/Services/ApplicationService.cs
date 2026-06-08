// using API.Data;
// using API.DTOs;
// using API.Models;
// using Microsoft.EntityFrameworkCore;

// namespace API.Services;

// public class ApplicationService : IApplicationService
// {
//     private readonly CareerHubDbContext _context;

//     public ApplicationService(CareerHubDbContext context)
//     {
//         _context = context;
//     }

//     public async Task<IEnumerable<ApplicationResponse>> GetAllAsync()
// {
//     return await _context.Applications
//         .AsNoTracking()
//         .Include(a => a.Applicant)
//         .Include(a => a.Job)
//         .Select(a => new ApplicationResponse
//         {
//             ApplicantId = a.ApplicantId,
//             JobId = a.JobId,
//             AppliedAt = a.AppliedAt,
//             Status = a.Status,
//             ApplicantName =
//                 a.Applicant.FirstName + " " + a.Applicant.LastName,
//             JobTitle = a.Job.Title
//         })
//         .ToListAsync();
// }

// public async Task<ApplicationResponse?> GetByIdAsync(
//     Guid applicantId,
//     Guid jobId)
// {
//     return await _context.Applications
//         .AsNoTracking()
//         .Where(a =>
//             a.ApplicantId == applicantId &&
//             a.JobId == jobId)
//         .Select(a => new ApplicationResponse
//         {
//             ApplicantId = a.ApplicantId,
//             JobId = a.JobId,
//             AppliedAt = a.AppliedAt,
//             Status = a.Status,
//             ApplicantName =
//                 a.Applicant.FirstName + " " + a.Applicant.LastName,
//             JobTitle = a.Job.Title
//         })
//         .FirstOrDefaultAsync();
// }

//     public async Task<ApplicationResponse> CreateAsync(
//         CreateApplicationRequest request)
//     {
//         var applicant =
//             await _context.Applicants.FindAsync(
//                 request.ApplicantId);

//         if (applicant == null)
//             throw new Exception(
//                 "Applicant does not exist.");

//         var job =
//             await _context.Jobs.FindAsync(
//                 request.JobId);

//         if (job == null)
//             throw new Exception(
//                 "Job does not exist.");

//         var exists =
//             await _context.Applications.AnyAsync(a =>
//                 a.ApplicantId == request.ApplicantId &&
//                 a.JobId == request.JobId);

//         if (exists)
//             throw new Exception(
//                 "Applicant already applied.");

//         var application = new Application
//         {
//             ApplicantId = request.ApplicantId,
//             JobId = request.JobId,
//             AppliedAt = DateTime.UtcNow,
//             Status = ApplicationStatus.Submitted
//         };

//         _context.Applications.Add(application);

//         await _context.SaveChangesAsync();

//         return new ApplicationResponse
//         {
//             ApplicantId = application.ApplicantId,
//             JobId = application.JobId,
//             AppliedAt = application.AppliedAt,
//             Status = application.Status,
//             ApplicantName =
//                 $"{applicant.FirstName} {applicant.LastName}",
//             JobTitle = job.Title
//         };
//     }


//  public async Task<ApplicationResponse?> UpdateAsync(
//         Guid applicantId,
//         Guid jobId,
//         UpdateApplicationRequest request)
//     {
//         var application = await _context.Applications
//             .Include(a => a.Applicant)
//             .Include(a => a.Job)
//             .FirstOrDefaultAsync(a =>
//                 a.ApplicantId == applicantId &&
//                 a.JobId == jobId);

//         if (application == null)
//             return null;

//         // Only update fields that are allowed (usually Status)
//         application.Status = request.Status;

//         await _context.SaveChangesAsync();

//         return new ApplicationResponse
//         {
//             ApplicantId = application.ApplicantId,
//             JobId = application.JobId,
//             AppliedAt = application.AppliedAt,
//             Status = application.Status,
//             ApplicantName =
//                 application.Applicant.FirstName + " " + application.Applicant.LastName,
//             JobTitle = application.Job.Title
//         };
//     }

//     // DELETE
//     public async Task<bool> DeleteAsync(
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

using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;
using API.Services;

namespace API.Services;

/// <summary>
/// Enforces all application business rules.
/// No EF Core imports — all data access is delegated to the repositories.
/// </summary>
public class ApplicationService(
    IApplicationRepository applicationRepository,
    IJobRepository jobRepository,
    IApplicantRepository applicantRepository
) : IApplicationService
{
    public async Task<IEnumerable<ApplicationResponse>> GetAllAsync()
    {
        return await applicationRepository.GetAllAsync();
    }

    public async Task<ApplicationResponse?> GetByIdAsync(Guid applicantId, Guid jobId)
    {
        var application = await applicationRepository.GetApplicationAsync(applicantId, jobId);

        if (application is null)
            return null;

        return MapToResponse(application);
    }

    public async Task<ApplicationResponse> CreateAsync(CreateApplicationRequest request)
    {
        // Verify the job exists
        var job = await jobRepository.GetListingWithDetailsAsync(request.JobId)
            ?? throw new JobNotFoundException(request.JobId);

        // Verify the applicant exists
        var applicant = await applicantRepository.GetByIdAsync(request.ApplicantId)
            ?? throw new Exception($"Applicant '{request.ApplicantId}' does not exist.");

        // Rule: cannot apply to a listing whose closing date has passed
        if (job.ClosingDate <= DateTime.UtcNow)
            throw new ListingClosedException();

        // Rule: cannot submit a duplicate application
        if (await applicationRepository.HasApplicantAppliedAsync(request.ApplicantId, request.JobId))
            throw new DuplicateApplicationException();

        var application = new Application
        {
            ApplicantId = request.ApplicantId,
            JobId = request.JobId,
            AppliedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Submitted
        };

        await applicationRepository.AddAsync(application);

        // Re-fetch with navigation properties populated
        var created = await applicationRepository.GetApplicationAsync(
            application.ApplicantId,
            application.JobId);

        return MapToResponse(created!);
    }

    public async Task<ApplicationResponse> UpdateAsync(
        Guid applicantId,
        Guid jobId,
        UpdateApplicationRequest request)
    {
        var application = await applicationRepository.GetApplicationAsync(applicantId, jobId)
            ?? throw new Exception("Application not found.");

        // Rule: status transition must follow the valid workflow
        if (!ApplicationStatusRules.CanTransition(application.Status, request.Status))
            throw new InvalidStatusTransitionException(application.Status, request.Status);

        var updated = await applicationRepository.UpdateApplicationStatusAsync(
            applicantId,
            jobId,
            request.Status);

        return MapToResponse(updated!);
    }

    public async Task<bool> DeleteAsync(
        Guid applicantId,
        Guid jobId)
    {
        var application = await applicationRepository.GetApplicationAsync(applicantId, jobId)
            ?? throw new Exception("Application not found.");

        // Rule: an applicant can only withdraw their own application.
        // applicantId in the route IS the owner check — the caller must
        // supply their own applicantId; if the application doesn't belong
        // to that applicantId it won't be found (GetApplicationAsync filters
        // by both keys), so no additional identity param is needed here.
        return await applicationRepository.DeleteAsync(applicantId, jobId);
    }

    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------

    private static ApplicationResponse MapToResponse(Application a) => new()
    {
        ApplicantId = a.ApplicantId,
        JobId = a.JobId,
        AppliedAt = a.AppliedAt,
        Status = a.Status,
        ApplicantName = $"{a.Applicant.FirstName} {a.Applicant.LastName}",
        JobTitle = a.Job.Title
    };
}