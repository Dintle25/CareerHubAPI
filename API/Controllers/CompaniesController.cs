using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class CompaniesController : ControllerBase
{
private readonly CareerHubDbContext _context;


public CompaniesController(CareerHubDbContext context)
{
    _context = context;
}

[HttpGet]
public async Task<IActionResult> GetAll()
{
    return Ok(await _context.Companies.ToListAsync());
}

[HttpGet("{id}")]
public async Task<IActionResult> GetById(Guid id)
{
    var company = await _context.Companies.FindAsync(id);

    if (company == null)
        return NotFound();

    return Ok(company);
}

// [HttpPost]
// public async Task<IActionResult> Create(Company company)
// {
//     company.Id = Guid.NewGuid();

//     _context.Companies.Add(company);
//     await _context.SaveChangesAsync();

//     return CreatedAtAction(nameof(GetById),
//         new { id = company.Id },
//         company);
// }

[HttpPost]
public async Task<IActionResult> Create(CreateCompanyRequest request)
{
    var company = new Company
    {
        Id = Guid.NewGuid(),
        Name = request.Name,
        Description = request.Description
    };

    _context.Companies.Add(company);
    await _context.SaveChangesAsync();

    return CreatedAtAction(
        nameof(GetById),
        new { id = company.Id },
        company);
}

}
