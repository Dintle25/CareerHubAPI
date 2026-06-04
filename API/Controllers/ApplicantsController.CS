using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ApplicantsController : ControllerBase
{
private readonly CareerHubDbContext _context;

public ApplicantsController(CareerHubDbContext context)
{
    _context = context;
}

[HttpGet]
public async Task<IActionResult> GetAll()
{
    return Ok(await _context.Applicants.ToListAsync());
}

[HttpGet("{id}")]
public async Task<IActionResult> GetById(Guid id)
{
    var applicant = await _context.Applicants.FindAsync(id);

    if (applicant == null)
        return NotFound();

    return Ok(applicant);
}

[HttpPost]
// public async Task<IActionResult> Create(Applicant applicant)
// {
//     applicant.Id = Guid.NewGuid();

//     _context.Applicants.Add(applicant);
//     await _context.SaveChangesAsync();

//     return CreatedAtAction(nameof(GetById),
//         new { id = applicant.Id },
//         applicant);
// }

public async Task<IActionResult> Create(
    CreateApplicantRequest request)
{
    var applicant = new Applicant
    {
        Id = Guid.NewGuid(),
        FirstName = request.FirstName,
        LastName = request.LastName,
        Email = request.Email
    };

    _context.Applicants.Add(applicant);

    await _context.SaveChangesAsync();

    return Ok(new ApplicantResponse
    {
        Id = applicant.Id,
        FirstName = applicant.FirstName,
        LastName = applicant.LastName,
        Email = applicant.Email
    });
}
}
