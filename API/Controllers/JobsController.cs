using Microsoft.AspNetCore.Mvc;
using API.Models;
using API.Data;
using API.DTOs;
using API.Exceptions;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    //private Job newJob;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetJobsAsync()
    {

        await Task.Delay(200);

        // var jobs = new List<Job>();  

        // if (!jobs.Any())
        //     return NotFound();

        return Ok(JobStore.Jobs);
    }

[HttpGet("{id}")]
    public async Task<ActionResult> GetJobByIdAsync(Guid id)
    {
        await Task.Delay(200);

       var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);

    if (job is null)
    {
        throw new JobNotFoundException(id);
    }

    return Ok(job);
    }

//POST--------------------------------------------------------------------------------------------------------------
[Authorize(Roles = "Employer")]
[HttpPost]
   public async Task<ActionResult<JobResponse>> CreateBookingAsync([FromBody] CreateJobRequest request)
    {
        await Task.Delay(50); // will replace with an actual database call 

        // Check for duplicate (case-insensitive)
        var exists = JobStore.Jobs.Any(j =>
            j.Title.Equals(request.Title, StringComparison.OrdinalIgnoreCase) &&
            j.Company.Equals(request.Company, StringComparison.OrdinalIgnoreCase));

        if (exists)
        {
            throw new DuplicateJobListingException(
            request.Company,
            request.Title);
        }


        //2. Map received DTO to actual Domain Model
        var newJob =  new Job(
            Guid.NewGuid(),
            request.Title,
            request.Description,
            request.Company,
            request.Location,
            request.Type);

    
        JobStore.Jobs.Add(newJob); 
        

        //4. Map Domain Model to to Response DTO
        var response = new JobResponse(
        
        ); 

        return CreatedAtAction(
            nameof(GetJobByIdAsync),
            new { id = newJob.Id },
            response);
    }

// put--------------------------------------------------------------------------------------------------------------------------
[Authorize(Roles = "Employer")]
    [HttpPut("{id}")]
    public async Task<ActionResult<JobResponse>> UpdateJobAsync(Guid id, [FromBody] UpdateJobRequest request)
    {
        await Task.Delay(100);

        var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);
        if (job == null)
             throw new JobNotFoundException(id);

     
        job.Title = request.Title;
        job.Description = request.Description;
        job.Company = request.Company;
        job.Location = request.Location;
        job.Type = request.Type;

        var response = ToJobResponse(job);
        return Ok(response);       
    }

    // delete----------------------------------------------------------------------------------------------------------------
    [Authorize(Roles = "Employer")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        await Task.Delay(50);

        var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);
        if (job == null)
            throw new JobNotFoundException(id);     

        JobStore.Jobs.Remove(job);
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