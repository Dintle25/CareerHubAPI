using API.Data;
using API.DTOs;
using API.Models;
using API.Services;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


[ApiController]
[ApiVersion(1)]
//[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
public class ApplicantsController : ControllerBase
{
//private readonly CareerHubDbContext _context;
private readonly IApplicantService _applicantService;

public ApplicantsController(
    IApplicantService applicantService)
{
    _applicantService = applicantService;
}

// public ApplicantsController(CareerHubDbContext context)
// {
//     _context = context;
// }

[HttpGet]
public async Task<IActionResult> GetAll()
{
    return Ok(
        await _applicantService.GetAllAsync());
}

[HttpGet("{id}")]
public async Task<IActionResult> GetById(Guid id)
{
    var applicant =
        await _applicantService.GetByIdAsync(id);

    if (applicant == null)
        return NotFound();

    return Ok(applicant);
}

// [HttpPost]
// public async Task<IActionResult> Create(Applicant applicant)
// {
//     applicant.Id = Guid.NewGuid();

//     _context.Applicants.Add(applicant);
//     await _context.SaveChangesAsync();

//     return CreatedAtAction(nameof(GetById),
//         new { id = applicant.Id },
//         applicant);
// }

[HttpPost]
public async Task<IActionResult> Create(
    CreateApplicantRequest request)
{
    var applicant =
        await _applicantService.CreateAsync(request);

    return CreatedAtAction(
        nameof(GetById),
        new { id = applicant.Id },
        applicant);
}
}
