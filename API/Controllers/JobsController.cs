using API.DTOs;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Asp.Versioning;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;

namespace API.Controllers;




[ApiController]
[ApiVersion(1)]
//[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
[Route("api/[controller]")]
public class JobsController(IJobService jobService) : ControllerBase
{

    [HttpGet]
    [EndpointSummary("List all jobs")]
    [EndpointDescription(
        "The X-Total-Count response header contains the total number of jobs " +
        "Returns a paginated list of jobs using a default page size " +
        "matching the current filter, regardless of page size.")]
    public async Task<ActionResult<PagedResponse<JobResponse>>> GetJobs(
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 20)
    {

        var filter = new JobListingFilterQuery();

        var result = await jobService.GetActiveListingsPagedAsync(
            filter,
            page,
            pageSize);

        Response.Headers["X-Total-Count"] =
            result.TotalCount.ToString();

        return Ok(result);
    }


    [HttpGet("search")]
    [EnableRateLimiting("search")]
    [EndpointSummary("Search jobs")]
    [EndpointDescription(
        "Rate limited to 20 requests per minute — full-text queries are expensive." +
        "When Q is provided, PostgreSQL full-text search is used with GIN index support. " )]
    public async Task<ActionResult<PagedResponse<JobResponse>>> SearchJobs(
   [FromQuery] string? location,
   [FromQuery] string? employmentType,
   [FromQuery] decimal? salaryMin,
   [FromQuery] decimal? salaryMax,
   [FromQuery] Guid? companyId,
   [FromQuery] string sort = "postedAt",
   [FromQuery] string? dir = null,
   [FromQuery] int page = 1,
   [FromQuery] int pageSize = 20)
    {
        Console.WriteLine($"employmentType = {employmentType}");
        var filter = new JobListingFilterQuery
        {
            Location = location,
            EmploymentType = employmentType,
            SalaryMin = salaryMin,
            SalaryMax = salaryMax,
            CompanyId = companyId,
            Sort = sort,
            Dir = dir
        };

        var result = await jobService.GetActiveListingsPagedAsync(
            filter,
            page,
            pageSize);

        Response.Headers["X-Total-Count"] =
            result.TotalCount.ToString();

        return Ok(result);
    }


    [HttpPatch("{id:guid}")]

    public async Task<IActionResult> Patch(
    Guid id,
    UpdateJobListingRequest request)
    => Ok(await jobService.PatchAsync(id, request));


    // [HttpGet("{id:guid}", Name = "GetJobById")]
    // public async Task<IActionResult> GetById(Guid id)
    // {
    //     var job = await jobService.GetByIdAsync(id);
    //     return job is null ? NotFound() : Ok(job);

    //     var etagRaw = $"{job.Id}-{job.PostedAt.Ticks}-{job.SalaryMin}";
    //     var etag = $"\"{etagRaw.GetHashCode()}\"";

    //     if (Request.Headers.IfNoneMatch == etag)
    //         return StatusCode(304);

    //     Response.Headers.ETag = etag;

    // }

    [HttpGet("{id:guid}")]
    [EndpointSummary("List a job")]
    [EndpointDescription(
        "Update Etag updatedAt every time the job listing or application changes. " +
        "A race condition can happen when two recruiters open the same job listing at the same time.")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var job = await jobService.GetByIdAsync(id);

        if (job is null)
            return NotFound();

        var etagRaw = $"{job.Id}-{job.PostedAt.Ticks}";
        var etag = $"\"{etagRaw.GetHashCode()}\"";

        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);

        Response.Headers.ETag = etag;

        return Ok(job);
    }

    //[Authorize (Roles ="employer")] 
    [EnableRateLimiting("post-listing")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobRequest request)
    {
        var created = await jobService.CreateAsync(request);
        //return CreatedAtAction("GetJobById", new { id = created.Id }, created);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }
    
     
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobRequest request)
    {
        var updated = await jobService.UpdateAsync(id, request);
        return Ok(updated);
    }

    //[Authorize (Roles ="employer")] 
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Close(Guid id)
    {
        await jobService.CloseAsync(id);
        return NoContent();
    }
}