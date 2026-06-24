using API.DTOs;
using API.Services;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace API.Controllers;


[ApiController]
[ApiVersion(1)]
//[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
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
        // var application = await applicationService.GetByIdAsync(applicantId, jobId);
        // return application is null ? NotFound() : Ok(application);
        var app = await applicationService.GetByIdAsync(applicantId, jobId);

        if (app is null)
            return NotFound();

        var etagRaw = $"{app.Id}-{app.Status}";
        var etag = $"\"{etagRaw.GetHashCode()}\"";

        if (Request.Headers.IfNoneMatch == etag)
            return StatusCode(304);

        Response.Headers.ETag = etag;

        return Ok(app);
    }

    [HttpPatch("{id:guid}/status")]
    
    [EndpointSummary("List an application")]
    [EndpointDescription(
        "Status transition validation belongs in the Service layer." +
        "Putting this validation in controllers or repository is illegal because Business rules would become duplicated if multiple controllers need the same validation.")]
    public async Task<IActionResult> UpdateStatus(
    Guid id,
    [FromBody] UpdateApplicationStatusRequest request)
    {
        try
        {
            var result = await applicationService
                .UpdateStatusAsync(id, request);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [Authorize]
    [EnableRateLimiting("apply")]
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