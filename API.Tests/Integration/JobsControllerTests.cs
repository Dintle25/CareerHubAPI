using System.Net;
using System.Text;
using System.Text.Json;
using API.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;

namespace API.Tests.Integration;

public class JobsControllerTests : IClassFixture<WebApplicationFactoryFixture>
{
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    public JobsControllerTests(WebApplicationFactoryFixture factory)
    {
        _client = factory.CreateClient();
    }


    [Fact]
    public async Task GetJobs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetJobs_ResponseIsPagedEnvelope()
    {
        var response = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=5");
        response.EnsureSuccessStatusCode();

        var body = await response.Content.ReadAsStringAsync();
        var paged = JsonSerializer.Deserialize<PagedResponse<JobResponse>>(body, _json);

        Assert.NotNull(paged);
        Assert.Equal(1, paged.Page);
        Assert.Equal(5, paged.PageSize);
        Assert.True(paged.TotalCount >= 0);
    }

    [Fact]
    public async Task GetJobs_ResponseIncludesXTotalCountHeader()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        Assert.True(
            response.Headers.Contains("X-Total-Count"),
            "Expected X-Total-Count response header to be present.");
    }

    [Fact]
    public async Task GetJobs_WithoutVersion_ReturnsSameStatusAsV1()
    {
        var unversioned = await _client.GetAsync("/api/jobs");
        var versioned   = await _client.GetAsync("/api/v1/jobs");

        Assert.Equal(versioned.StatusCode, unversioned.StatusCode);
    }

    [Fact]
    public async Task GetJobs_ResponseIncludesApiSupportedVersionsHeader()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        Assert.True(
            response.Headers.Contains("api-supported-versions"),
            "Expected api-supported-versions header to be present.");

        var value = response.Headers.GetValues("api-supported-versions").First();
        Assert.Contains("1.0", value);
    }


    [Fact]
    public async Task PostJob_WithoutToken_Returns401()
    {
        var body = new StringContent(
            JsonSerializer.Serialize(new
            {
                companyId   = Guid.NewGuid(),
                title       = "Test Role",
                description = "desc",
                location    = "London",
                type        = "FullTime",
                closingDate = DateTime.UtcNow.AddDays(30)
            }),
            Encoding.UTF8,
            "application/json");

        var response = await _client.PostAsync("/api/v1/jobs", body);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PostApplication_WithoutToken_Returns401()
    {
        var body = new StringContent(
            JsonSerializer.Serialize(new
            {
                applicantId = Guid.NewGuid(),
                jobId       = Guid.NewGuid()
            }),
            Encoding.UTF8,
            "application/json");

        var response = await _client.PostAsync("/api/v1/applications", body);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }


    [Fact]
    public async Task GetJobById_WithValidId_DoesNotReturn500()
    {
        var response = await _client.GetAsync($"/api/v1/jobs/{Guid.NewGuid()}");

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected 200 or 404 but got {(int)response.StatusCode}.");
    }

    [Fact]
    public async Task GetJobById_ResponseIncludesETagHeader()
    {
        var listResponse = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=1");
        listResponse.EnsureSuccessStatusCode();

        var body  = await listResponse.Content.ReadAsStringAsync();
        var paged = JsonSerializer.Deserialize<PagedResponse<JobResponse>>(body, _json);

        var firstJob = paged?.Data.FirstOrDefault();
        if (firstJob is null)
        {
            return;
        }

        var response = await _client.GetAsync($"/api/v1/jobs/{firstJob.Id}");
        response.EnsureSuccessStatusCode();

        Assert.True(
            response.Headers.ETag is not null,
            "Expected ETag response header to be present.");

        Assert.False(
            string.IsNullOrWhiteSpace(response.Headers.ETag?.Tag),
            "Expected ETag value to be non-empty.");
    }

    [Fact]
    public async Task GetJobById_WithMatchingETag_Returns304()
    {
        var listResponse = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=1");
        listResponse.EnsureSuccessStatusCode();

        var body  = await listResponse.Content.ReadAsStringAsync();
        var paged = JsonSerializer.Deserialize<PagedResponse<JobResponse>>(body, _json);

        var firstJob = paged?.Data.FirstOrDefault();
        if (firstJob is null)
        {
            return;
        }

        var first = await _client.GetAsync($"/api/v1/jobs/{firstJob.Id}");
        first.EnsureSuccessStatusCode();

        var etag = first.Headers.ETag?.ToString();
        Assert.NotNull(etag);

        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/jobs/{firstJob.Id}");
        request.Headers.TryAddWithoutValidation("If-None-Match", etag);

        var second = await _client.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotModified, second.StatusCode);
    }
}