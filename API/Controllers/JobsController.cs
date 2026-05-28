using Microsoft.AspNetCore.Mvc;
using API.Models;
using API.Data;
using API.DTOs;

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
    public async Task<ActionResult> GetJobByIdAsync(int id)
    {
        await Task.Delay(200);

        var job = JobStore.Jobs.FirstOrDefault();

        return job is not null 
            ? Ok(job) 
            : NotFound();
    }

//POST--------------------------------------------------------------------------------------------------------------
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
            return Conflict(new { detail = "A job with the same title and company already exists." });
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
    [HttpPut("{id}")]
    public async Task<ActionResult<JobResponse>> UpdateJobAsync(Guid id, [FromBody] UpdateJobRequest request)
    {
        await Task.Delay(100);

        var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);
        if (job == null)
            return NotFound();

     
        job.Title = request.Title;
        job.Description = request.Description;
        job.Company = request.Company;
        job.Location = request.Location;
        job.Type = request.Type;

        var response = ToJobResponse(job);
        return Ok(response);       
    }

    // delete----------------------------------------------------------------------------------------------------------------
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteJob(Guid id)
    {
        await Task.Delay(50);

        var job = JobStore.Jobs.FirstOrDefault(j => j.Id == id);
        if (job == null)
            return NoContent();    

        JobStore.Jobs.Remove(job);
        return NoContent();
    }

    //  [HttpPut("{id:guid}")]
    // public async Task<ActionResult<JobResponse>> UpdateJobAsync(Guid id, [FromBody] CreateJobRequest request)
    
    // {
    //     await Task.Delay(50); 


    //     var existingJob  = JobStore.jobs.FirstOrDefault(b => b.Id == id);

    //     if (existingJob == null)
    //     {
    //         return NotFound(); 
    //     }}


        // var updatedJob = existingJob with
        // {
        //     Title = request.Title;
        //     Description = request.Description;
        //     Company = request.Company;
        //     Location = request.Location;
        //     Type = request.Type;
        // };

  
        // JobStore.jobs.Remove(existingJob);
        // JobStore.jobs.Add(updatedJob);

       

        // //4. Map Domain Model to to Response DTO
        // var response = new BookingResponse(
        //     Guid.NewGuid(),
        //     UpdatedJob.Title,
        //     updatedJob.Description,
        //     updatedJob.Company,
        //     updatedJob.Location,
        //     updatedJob.Type
        // ); 


        // return Ok(response);

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