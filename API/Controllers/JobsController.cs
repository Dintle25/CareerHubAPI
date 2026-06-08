// using Microsoft.AspNetCore.Mvc;
// using API.Models;
// using API.Data;
// using API.DTOs;
// using API.Exceptions;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.AspNetCore.Authorization;
// using System.Reflection.Emit;

// [ApiController]
// [Route("api/[controller]")]
// public class JobsController : ControllerBase
// {
//     //private Job newJob;
//     // Database context (replaces JobStore)
//     private readonly CareerHubDbContext _context;

//     // Inject DbContext
//     public JobsController(CareerHubDbContext context)
//     {
//         _context = context;
//     }

//     [HttpGet]
//     public async Task<ActionResult<IEnumerable<Job>>> GetJobsAsync()
//     {

//         // Get all jobs from database----------------------------------------eager
//         // // var jobs = await _context.Jobs.ToListAsync();

//         // var jobs = await _context.Jobs
//         // .Include(j => j.Company)
//         // .ToListAsync();

//         var jobs = await _context.Jobs
//     .AsNoTracking()
//     .Select(j => new JobResponse
//     {
//         Id = j.Id,
//         Title = j.Title,
//         Description = j.Description,
//         Location = j.Location,
//         Type = j.Type,
//         ClosingDate = j.ClosingDate,
//         PostedAt = j.PostedAt,
//         IsActive = j.IsActive,

//         Company = j.Company.Name,

//         SalaryDisplay = "N/A",

//         // IMPORTANT: computed in SQL, not memory
//         // (EF translates this to COUNT(*))
//         ApplicationCount = j.Applications.Count()
//     })
//     .ToListAsync();

//         return Ok(jobs);
//     }

//     [HttpGet("{id}", Name = "GetJobById")]
//     public async Task<ActionResult> GetJobByIdAsync(Guid id)
//     {
//         // Find job in database by primary key
//         var job = await _context.Jobs.FindAsync(id);

//         if (job is null)
//         {
//             throw new JobNotFoundException(id);
//         }

//         return Ok(job);
//     }

//     //POST--------------------------------------------------------------------------------------------------------------
//     //[Authorize(Roles = "employer")]
//     [HttpPost]
//     public async Task<ActionResult<JobResponse>> CreateJobAsync([FromBody] CreateJobRequest request)
//     {
//         await Task.Delay(50); // will replace with an actual database call 
//         var company = await _context.Companies.FindAsync(request.CompanyId);

//         if (company == null)
//         {
//             return BadRequest("Company does not exist.");
//         }

//         // Check for duplicate job (database query instead of memory list)
//         // var exists = await _context.Jobs.AnyAsync(j =>
//         // j.Title.ToLower() == request.Title.ToLower() &&
//         // j.Company.ToLower() == request.Company.ToLower());
//         var exists = await _context.Jobs.AnyAsync(j =>
//         j.Title.ToLower() == request.Title.ToLower() &&
//         j.CompanyId == request.CompanyId);

//         if (exists)
//         {
//             throw new DuplicateJobListingException(
//             company.Name,
//             request.Title);
//         }

        

//         //2. Map received DTO to actual Domain Model
//         var newJob = new Job(
//             Guid.NewGuid(),
//             request.Title,
//             request.Description,
//             company,
//             request.Location,
//             request.Type,
//             request.ClosingDate);

//         // Add to change tracker
//         _context.Jobs.Add(newJob);

//         //JobStore.Jobs.Add(newJob);

//         // Save to database
//         await _context.SaveChangesAsync();

//         // Map Entity → DTO
//         var response = ToJobResponse(newJob);


//         //     return CreatedAtAction(
//         //     nameof(GetJobByIdAsync),
//         //      new { id = newJob.Id },
//         //      response);
//         //    //Return 201 Created with the response body
//         //  // return StatusCode(StatusCodes.Status201Created, response);

//         return CreatedAtRoute(
//       "GetJobById",
//       new { id = newJob.Id },
//       response);

//     }

//     // put--------------------------------------------------------------------------------------------------------------------------
//     //[Authorize(Roles = "employer")]
//     [HttpPut("{id}")]
//     public async Task<ActionResult<JobResponse>> UpdateJobAsync(Guid id, [FromBody] UpdateJobRequest request)
//     {
//         var job = await _context.Jobs.FindAsync(id);


//         // var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);
//         // if (job == null)
//         //     throw new JobNotFoundException(id);


//         if (job == null)
//             throw new JobNotFoundException(id);

//         job.Title = request.Title;
//         job.Description = request.Description;
//         var company = await _context.Companies.FindAsync(request.CompanyId);

//         if (company == null)
//         {
//             return BadRequest("Company does not exist.");
//         }

//         job.Company = company;
//         job.CompanyId = company.Id;
//         job.Location = request.Location;
//         job.Type = request.Type;

//         // Save changes (EF tracks updates automatically)
//         await _context.SaveChangesAsync();

//         return Ok(ToJobResponse(job));
//     }

//     // delete----------------------------------------------------------------------------------------------------------------
//     //[Authorize(Roles = "employer")]
//     [HttpDelete("{id}")]
//     public async Task<IActionResult> DeleteJob(Guid id)
//     {
//         var job = await _context.Jobs.FindAsync(id);

//         if (job == null)
//             throw new JobNotFoundException(id);

//         _context.Jobs.Remove(job);

//         await _context.SaveChangesAsync();

//         return NoContent();
//     }



//     private static JobResponse ToJobResponse(Job job)
//     {
//         return new JobResponse
//         {
//             Id = job.Id,
//             Title = job.Title,
//             Description = job.Description,
//             Company = job.Company.Name,
//             Location = job.Location,
//             Type = job.Type,
//             ClosingDate = job.ClosingDate,
//             PostedAt = job.PostedAt,
//             IsActive = job.IsActive,
//             SalaryDisplay = "Salary not specified"
//         };
//     }


// }

using API.DTOs;
using API.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobsController(IJobService jobService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var jobs = await jobService.GetActiveListingsAsync();
        return Ok(jobs);
    }

    [HttpGet("{id:guid}", Name = "GetJobById")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await jobService.GetByIdAsync(id);
        return job is null ? NotFound() : Ok(job);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request)
    {
        var created = await jobService.CreateAsync(request);
        return CreatedAtRoute("GetJobById", new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobRequest request)
    {
        var updated = await jobService.UpdateAsync(id, request);
        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Close(Guid id)
    {
        await jobService.CloseAsync(id);
        return NoContent();
    }
}