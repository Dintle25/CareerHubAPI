// using API.Data;
// using API.DTOs;
// using API.Models;
// using API.Services;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;

// [ApiController]
// [Route("api/[controller]")]
// public class ApplicationsController : ControllerBase
// {
//     //private readonly CareerHubDbContext _context;
//     private readonly IApplicationService _applicationService;

//     public ApplicationsController(
//         IApplicationService applicationService)
//     {
//         _applicationService = applicationService;
//     }

//     // public ApplicationsController(CareerHubDbContext context)
//     // {
//     //     _context = context;
//     // }

//     // [HttpGet]
//     // public async Task<IActionResult> GetAll()
//     // {
//     //     var applications = await _context.Applications
//     //         .Include(a => a.Applicant)
//     //         .Include(a => a.Job)
//     //         .AsNoTracking()
//     //         .ToListAsync();

//     //     return Ok(applications);
//     // }

//     [HttpGet]
//     public async Task<IActionResult> GetAll()
//     {
//         var applications =
//             await _applicationService.GetAllAsync();

//         return Ok(applications);
//     }


//     [HttpPost]
//     public async Task<IActionResult> Create(
//       CreateApplicationRequest request)
//     {
//         var application =
//             await _applicationService.CreateAsync(request);

//         return Ok(application);
//     }

//     // [HttpPost]
//     // public async Task<IActionResult> Create(
//     //     CreateApplicationRequest request)
//     // {
//     //     bool exists = await _context.Applications.AnyAsync(a =>
//     //         a.ApplicantId == application.ApplicantId &&
//     //         a.JobId == application.JobId);

//     //     if (exists)
//     //         return Conflict("Applicant has already applied for this job.");

//     //     application.AppliedAt = DateTime.UtcNow;

//     //     _context.Applications.Add(application);

//     //     await _context.SaveChangesAsync();

//     //     return Ok(application);
//     // }

//     // ✅ GET by composite key
//     [HttpGet("{applicantId:guid}/{jobId:guid}")]
//     public async Task<IActionResult> GetById(
//         Guid applicantId,
//         Guid jobId)
//     {
//         var application =
//             await _applicationService.GetByIdAsync(applicantId, jobId);

//         if (application == null)
//             return NotFound();

//         return Ok(application);
//     }

//     //  UPDATE (Status only)
//     [HttpPut("{applicantId:guid}/{jobId:guid}")]
//     public async Task<IActionResult> Update(
//         Guid applicantId,
//         Guid jobId,
//         UpdateApplicationRequest request)
//     {
//         var updated =
//             await _applicationService.UpdateAsync(applicantId, jobId, request);

//         if (updated == null)
//             return NotFound();

//         return Ok(updated);
//     }

//     //  DELETE
//     [HttpDelete("{applicantId:guid}/{jobId:guid}")]
//     public async Task<IActionResult> Delete(
//         Guid applicantId,
//         Guid jobId)
//     {
//         var deleted =
//             await _applicationService.DeleteAsync(applicantId, jobId);

//         if (!deleted)
//             return NotFound();

//         return NoContent();
//     }

// }


using API.DTOs;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController(IApplicationService applicationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var applications = await applicationService.GetAllAsync();
        return Ok(applications);
    }

    [HttpGet("{applicantId:guid}/{jobId:guid}")]
    public async Task<IActionResult> GetById(Guid applicantId, Guid jobId)
    {
        var application = await applicationService.GetByIdAsync(applicantId, jobId);
        return application is null ? NotFound() : Ok(application);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateApplicationRequest request)
    {
        var created = await applicationService.CreateAsync(request);
        return Ok(created);
    }

    [HttpPut("{applicantId:guid}/{jobId:guid}")]
    public async Task<IActionResult> Update(
        Guid applicantId,
        Guid jobId,
        [FromBody] UpdateApplicationRequest request)
    {
        var updated = await applicationService.UpdateAsync(applicantId, jobId, request);
        return Ok(updated);
    }

    [HttpDelete("{applicantId:guid}/{jobId:guid}")]
    public async Task<IActionResult> Delete(Guid applicantId, Guid jobId)
    {
        await applicationService.DeleteAsync(applicantId, jobId);
        return NoContent();
    }
}