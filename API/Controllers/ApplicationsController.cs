using API.Data;
using API.DTOs;
using API.Models;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    //private readonly CareerHubDbContext _context;
    private readonly IApplicationService _applicationService;

    public ApplicationsController(
        IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    // public ApplicationsController(CareerHubDbContext context)
    // {
    //     _context = context;
    // }

    // [HttpGet]
    // public async Task<IActionResult> GetAll()
    // {
    //     var applications = await _context.Applications
    //         .Include(a => a.Applicant)
    //         .Include(a => a.Job)
    //         .AsNoTracking()
    //         .ToListAsync();

    //     return Ok(applications);
    // }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications =
            await _applicationService.GetAllAsync();

        return Ok(applications);
    }


    [HttpPost]
    public async Task<IActionResult> Create(
      CreateApplicationRequest request)
    {
        var application =
            await _applicationService.CreateAsync(request);

        return Ok(application);
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
