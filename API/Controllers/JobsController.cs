using Microsoft.AspNetCore.Mvc;
using API.Models;
using API.Data;
using API.DTOs;
using API.Exceptions;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    //private Job newJob;
    // Database context (replaces JobStore)
    private readonly CareerHubDbContext _context;

    // Inject DbContext
    public JobsController(CareerHubDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetJobsAsync()
    {

        // Get all jobs from database
        var jobs = await _context.Jobs.ToListAsync();

        return Ok(jobs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetJobByIdAsync(Guid id)
    {
        // Find job in database by primary key
        var job = await _context.Jobs.FindAsync(id);

        if (job is null)
        {
            throw new JobNotFoundException(id);
        }

        return Ok(job);
    }

    //POST--------------------------------------------------------------------------------------------------------------
    [HttpPost]
    public async Task<ActionResult<JobResponse>> CreateBookingAsync([FromBody] CreateJobRequest request)
    {
        await Task.Delay(50); // will replace with an actual database call 

        // Check for duplicate job (database query instead of memory list)
        var exists = await _context.Jobs.AnyAsync(j =>
        j.Title.ToLower() == request.Title.ToLower() &&
        j.Company.ToLower() == request.Company.ToLower());

        if (exists)
        {
            throw new DuplicateJobListingException(
            request.Company,
            request.Title);
        }


        //2. Map received DTO to actual Domain Model
        var newJob = new Job(
            Guid.NewGuid(),
            request.Title,
            request.Description,
            request.Company,
            request.Location,
            request.Type);

        // Add to change tracker
        _context.Jobs.Add(newJob);

        //JobStore.Jobs.Add(newJob);

        // Save to database
        await _context.SaveChangesAsync();

        // Map Entity → DTO
        var response = ToJobResponse(newJob);


        return CreatedAtAction(
    nameof(GetJobByIdAsync),
    new { id = newJob.Id },
    response);
    }

    // put--------------------------------------------------------------------------------------------------------------------------
    [HttpPut("{id}")]
    public async Task<ActionResult<JobResponse>> UpdateJobAsync(Guid id, [FromBody] UpdateJobRequest request)
    {
        var job = await _context.Jobs.FindAsync(id);


        // var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);
        // if (job == null)
        //     throw new JobNotFoundException(id);


        if (job == null)
            throw new JobNotFoundException(id);

        job.Title = request.Title;
        job.Description = request.Description;
        job.Company = request.Company;
        job.Location = request.Location;
        job.Type = request.Type;

        // Save changes (EF tracks updates automatically)
        await _context.SaveChangesAsync();

        return Ok(ToJobResponse(job));
    }

    // delete----------------------------------------------------------------------------------------------------------------
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        var job = await _context.Jobs.FindAsync(id);

    if (job == null)
        throw new JobNotFoundException(id);

    _context.Jobs.Remove(job);

    await _context.SaveChangesAsync();

    return NoContent();
    }



    private static JobResponse ToJobResponse(Job job)
    {
        return new JobResponse
        {
            Id = job.Id,
            Title = job.Title,
            Description = job.Description,
            Company = job.Company,
            Location = job.Location,
            Type = job.Type,
            PostedAt = job.PostedAt,
            IsActive = job.IsActive,
            SalaryDisplay = "Salary not specified"
        };
    }


}