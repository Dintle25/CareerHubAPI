using Microsoft.AspNetCore.Mvc;
using API.Models;
using API.Data;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Job>>> GetJobsAsync()
    {

        await Task.Delay(200);

        // var jobs = new List<Job>();  

        // if (!jobs.Any())
        //     return NotFound();

        return Ok(JobStore.jobs);
    }

[HttpGet("{id}")]
    public async Task<ActionResult> GetJobById(int id)
    {
        await Task.Delay(200);

        var job = JobStore.jobs.FirstOrDefault();

        return job is not null 
            ? Ok(job) 
            : NotFound();
    }

}