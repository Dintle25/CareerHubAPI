using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;

namespace API.Services;

public class ApplicationService(
    IApplicationRepository applicationRepository,
    IJobRepository jobRepository
) : IApplicationService
{
    public async Task<IEnumerable<ApplicationResponse>> GetAllAsync()
    {
        return await applicationRepository.GetAllAsync();
    }

    // Get by single Id — no longer composite key
    public async Task<ApplicationResponse?> GetByIdAsync(Guid applicantId, Guid jobId)
    {
        var application = await applicationRepository.GetApplicationAsync(applicantId, jobId);
        if (application is null) return null;
        return MapToResponse(application);
    }

    public async Task<ApplicationResponse> CreateAsync(CreateApplicationRequest request)
    {
        // Verify the job exists
        var job = await jobRepository.GetListingWithDetailsAsync(request.JobId)
            ?? throw new JobNotFoundException(request.JobId);

        // Rule: cannot apply to a closed listing
        if (job.ClosingDate <= DateTime.UtcNow)
            throw new ListingClosedException();

        // Rule: prevent duplicate applications from same email to same job
        if (await applicationRepository.HasEmailAppliedAsync(request.Email, request.JobId))
            throw new DuplicateApplicationException();

        var application = new Application
        {
            JobId = request.JobId,
            FullName = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            YearsOfExperience = request.YearsOfExperience,
            CoverLetter = request.CoverLetter,
            LinkedInUrl = request.LinkedInUrl,
            AvailableImmediately = request.AvailableImmediately,
            NoticePeriodWeeks = request.NoticePeriodWeeks,
            AppliedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Submitted
        };

        await applicationRepository.AddAsync(application);

        return MapToResponse(application);
    }

    public async Task<ApplicationResponse> UpdateStatusAsync(
        Guid id,
        UpdateApplicationStatusRequest request)
    {
        var application = await applicationRepository.GetByIdAsync(id)
            ?? throw new Exception("Application not found");

        // Rule: cannot move back to Submitted once Rejected or Offered
        if ((application.Status == ApplicationStatus.Rejected ||
             application.Status == ApplicationStatus.Offered) &&
             request.Status == ApplicationStatus.Submitted)
        {
            throw new ArgumentException(
                "Cannot move an application from Rejected or Offered back to Submitted.");
        }

        application.Status = request.Status;
        await applicationRepository.UpdateAsync(application);

        return MapToResponse(application);
    }

    public async Task<ApplicationResponse> UpdateAsync(
        Guid applicantId,
        Guid jobId,
        UpdateApplicationRequest request)
    {
        var application = await applicationRepository.GetApplicationAsync(applicantId, jobId)
            ?? throw new Exception("Application not found.");

        if (!ApplicationStatusRules.CanTransition(application.Status, request.Status))
            throw new InvalidStatusTransitionException(application.Status, request.Status);

        var updated = await applicationRepository.UpdateApplicationStatusAsync(
            application.Id, request.Status);

        return MapToResponse(updated!);
    }

    public async Task<bool> DeleteAsync(Guid applicantId, Guid jobId)
    {
        var application = await applicationRepository.GetApplicationAsync(applicantId, jobId)
            ?? throw new Exception("Application not found.");

        return await applicationRepository.DeleteAsync(application.Id);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private static ApplicationResponse MapToResponse(Application a) => new()
    {
        Id = a.Id,
        JobId = a.JobId,
        Email = a.Email,
        SubmittedAt = a.AppliedAt.ToString("o"), // ISO 8601
         Status = a.Status
    };
}

// using API.DTOs;
// using API.Exceptions;
// using API.Models;
// using API.Repositories;
// using API.Services;

// namespace API.Services;

// // IApplicantRepository removed from constructor — no longer needed
// // since applicant details now come directly from the form
// public class ApplicationService(
//     IApplicationRepository applicationRepository,
//     IJobRepository jobRepository
// ) : IApplicationService
// {
//     public async Task<IEnumerable<ApplicationResponse>> GetAllAsync()
//     {
//         return await applicationRepository.GetAllAsync();
//     }

//     // GetById now uses just the application's own Id, not a composite applicantId+jobId
//     public async Task<ApplicationResponse?> GetByIdAsync(Guid id)
//     {
//         var application = await applicationRepository.GetByIdAsync(id);

//         if (application is null)
//             return null;

//         return MapToResponse(application);
//     }

//     public async Task<ApplicationResponse> CreateAsync(CreateApplicationRequest request)
//     {
//         // Verify the job exists
//         var job = await jobRepository.GetListingWithDetailsAsync(request.JobId)
//             ?? throw new JobNotFoundException(request.JobId);

//         // Rule: cannot apply to a listing whose closing date has passed
//         if (job.ClosingDate <= DateTime.UtcNow)
//             throw new ListingClosedException();

//         var application = new Application
//         {
//             JobId = request.JobId,
//             FullName = request.FullName,
//             Email = request.Email,
//             Phone = request.Phone,
//             YearsOfExperience = request.YearsOfExperience,
//             CoverLetter = request.CoverLetter,
//             LinkedInUrl = request.LinkedInUrl,
//             AvailableImmediately = request.AvailableImmediately,
//             NoticePeriodWeeks = request.NoticePeriodWeeks,
//             AppliedAt = DateTime.UtcNow,
//             Status = ApplicationStatus.Submitted
//         };

//         await applicationRepository.AddAsync(application);

//         return new ApplicationResponse
//         {
//             Id = application.Id,
//             JobId = application.JobId,
//             Email = application.Email,
//             SubmittedAt = application.AppliedAt.ToString("o") // ISO 8601 timestamp
//         };
//     }

//     public async Task<ApplicationResponse> UpdateStatusAsync(
//         Guid id,
//         UpdateApplicationStatusRequest request)
//     {
//         var application = await applicationRepository.GetByIdAsync(id)
//             ?? throw new Exception("Application not found");

//         // Rule: cannot move back to Submitted once Rejected or Offered
//         if ((application.Status == ApplicationStatus.Rejected ||
//              application.Status == ApplicationStatus.Offered) &&
//              request.Status == ApplicationStatus.Submitted)
//         {
//             throw new ArgumentException(
//                 "Cannot move an application from Rejected or Offered back to Submitted.");
//         }

//         application.Status = request.Status;
//         await applicationRepository.UpdateAsync(application);

//         // Return updated application using the shared mapper
//         return MapToResponse(application);
//     }

//     public async Task<ApplicationResponse> UpdateAsync(
//     Guid id,
//     UpdateApplicationRequest request)
//     {
//         var application = await applicationRepository.GetByIdAsync(id)
//             ?? throw new Exception("Application not found.");

//         // Rule: status transition must follow the valid workflow
//         if (!ApplicationStatusRules.CanTransition(application.Status, request.Status))
//             throw new InvalidStatusTransitionException(application.Status, request.Status);

//         var updated = await applicationRepository.UpdateApplicationStatusAsync(
//         id,
//         request.Status);

//         return MapToResponse(updated!);
//     }

//     public async Task<bool> DeleteAsync(Guid id)
//     {
//         var application = await applicationRepository.GetByIdAsync(id)
//             ?? throw new Exception("Application not found.");

//         return await applicationRepository.DeleteAsync(id);
//     }

//     // ── Private helpers ───────────────────────────────────────────────────────

//     // Maps an Application entity to the response DTO the API returns
//     private static ApplicationResponse MapToResponse(Application a) => new()
//     {
//         Id = a.Id,
//         JobId = a.JobId,
//         Email = a.Email,
//         SubmittedAt = a.AppliedAt.ToString("o") // ISO 8601 e.g. "2026-06-23T02:00:00.000Z"
//     };
// }