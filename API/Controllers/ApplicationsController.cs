using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly CareerHubDbContext _context;

    public ApplicationsController(CareerHubDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications = await _context.Applications
            .Include(a => a.Applicant)
            .Include(a => a.Job)
            .AsNoTracking()
            .ToListAsync();

        return Ok(applications);
    }


    [HttpPost]
    public async Task<ActionResult<ApplicationResponse>> CreateApplicationAsync(
        [FromBody] CreateApplicationRequest request)
    {
        // Check that the applicant exists
        var applicant = await _context.Applicants
            .FindAsync(request.ApplicantId);

        if (applicant == null)
        {
            return BadRequest("Applicant does not exist.");
        }

        // Check that the job exists
        var job = await _context.Jobs
            .FindAsync(request.JobId);

        if (job == null)
        {
            return BadRequest("Job does not exist.");
        }

        // Prevent duplicate applications
        var exists = await _context.Applications
            .AnyAsync(a =>
                a.ApplicantId == request.ApplicantId &&
                a.JobId == request.JobId);

        if (exists)
        {
            return Conflict(
                "This applicant has already applied for this job.");
        }

        // Create application
        var application = new Application
        {
            ApplicantId = request.ApplicantId,
            JobId = request.JobId,
            AppliedAt = DateTime.UtcNow,
            Status = ApplicationStatus.Submitted
        };

        _context.Applications.Add(application);

        await _context.SaveChangesAsync();

        // Build response DTO
        var response = new ApplicationResponse
        {
            ApplicantId = application.ApplicantId,
            JobId = application.JobId,
            AppliedAt = application.AppliedAt,
            Status = application.Status,
            ApplicantName =
                $"{applicant.FirstName} {applicant.LastName}",
            JobTitle = job.Title
        };

        return Ok(response);
    }

    // [HttpPost]
    // public async Task<IActionResult> Create(
    //     CreateApplicationRequest request)
    // {
    //     bool exists = await _context.Applications.AnyAsync(a =>
    //         a.ApplicantId == application.ApplicantId &&
    //         a.JobId == application.JobId);

    //     if (exists)
    //         return Conflict("Applicant has already applied for this job.");

    //     application.AppliedAt = DateTime.UtcNow;

    //     _context.Applications.Add(application);

    //     await _context.SaveChangesAsync();

    //     return Ok(application);
    // }

}
