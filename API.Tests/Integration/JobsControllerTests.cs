using System.Net;
using System.Text;
using System.Text.Json;
using API.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;

namespace API.Tests.Integration;

// This is an INTEGRATION test class — it tests the real HTTP API end to end.
// IClassFixture means all tests in this class SHARE one instance of the factory,
// so the server only boots once, making the tests faster.
public class JobsControllerTests : IClassFixture<WebApplicationFactoryFixture>
{
    // This is the HTTP client we use to make requests to our fake test server
    private readonly HttpClient _client;

    // These are JSON settings we reuse across all tests.
    // PropertyNameCaseInsensitive means "Id" and "id" are treated the same.
    // JsonStringEnumConverter means enums come back as strings like "FullTime"
    // instead of numbers like 0.
    private static readonly JsonSerializerOptions _json = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    // The constructor runs before every test.
    // The factory gives us a fake version of our API running in memory —
    // no need to start the real server manually.
    public JobsControllerTests(WebApplicationFactoryFixture factory)
    {
        _client = factory.CreateClient();
    }

    // TEST 1: The most basic check — does GET /api/v1/jobs respond at all?
    // If the route is broken or the server crashes, this fails.
    [Fact]
    public async Task GetJobs_ReturnsOk()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        // We expect HTTP 200 OK
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // TEST 2: Does the response body have the right shape?
    // We request page 1 with 5 items, then deserialise the JSON body
    // and check that the paging envelope has the correct values.
    [Fact]
    public async Task GetJobs_ResponseIsPagedEnvelope()
    {
        var response = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=5");
        response.EnsureSuccessStatusCode(); // throws if not 200

        var body = await response.Content.ReadAsStringAsync();

        // Turn the raw JSON string into a typed C# object
        var paged = JsonSerializer.Deserialize<PagedResponse<JobResponse>>(body, _json);

        Assert.NotNull(paged);           // the body wasn't empty or wrong shape
        Assert.Equal(1, paged.Page);     // page number matches what we asked for
        Assert.Equal(5, paged.PageSize); // page size matches what we asked for
        Assert.True(paged.TotalCount >= 0); // total count is a sensible number
    }

    // TEST 3: Does the response include the X-Total-Count header?
    // The controller manually sets this header so the frontend knows
    // how many total jobs exist without reading the body.
    [Fact]
    public async Task GetJobs_ResponseIncludesXTotalCountHeader()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        Assert.True(
            response.Headers.Contains("X-Total-Count"),
            "Expected X-Total-Count response header to be present.");
    }

    // TEST 4: Does the unversioned route /api/jobs behave the same as /api/v1/jobs?
    // We configured AssumeDefaultVersionWhenUnspecified = true, so both
    // routes should return the same HTTP status code.
    [Fact]
    public async Task GetJobs_WithoutVersion_ReturnsSameStatusAsV1()
    {
        var versioned   = await _client.GetAsync("/api/v1/jobs");
        var unversioned = await _client.GetAsync("/api/jobs");

        // Both should return the same status — we don't care what it is,
        // just that they're consistent with each other
        Assert.Equal(versioned.StatusCode, unversioned.StatusCode);
    }

    // TEST 5: Does the response include the api-supported-versions header?
    // This header is added automatically by the versioning middleware
    // when ReportApiVersions = true. It tells clients which versions exist.
    [Fact]
    public async Task GetJobs_ResponseIncludesApiSupportedVersionsHeader()
    {
        var response = await _client.GetAsync("/api/v1/jobs");

        Assert.True(
            response.Headers.Contains("api-supported-versions"),
            "Expected api-supported-versions header to be present.");

        // The header value should contain "1.0" since that's our only version
        var value = response.Headers.GetValues("api-supported-versions").First();
        Assert.Contains("1.0", value);
    }

    // TEST 6: Can an anonymous user (no token) create a job?
    // The answer must be NO — the endpoint requires authentication.
    // We send a valid request body but no Authorization header
    // and expect 401 Unauthorized back.
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

        // Must be blocked before it even reaches the controller
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    // TEST 7: Same idea for applications — anonymous users cannot apply.
    // No token = 401, even if the body is valid.
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

    // TEST 8: Does fetching a job by ID ever crash the server?
    // We use a random GUID that almost certainly doesn't exist.
    // The acceptable responses are 200 (found) or 404 (not found).
    // A 500 means the server threw an unhandled exception — never acceptable.
    [Fact]
    public async Task GetJobById_WithValidId_DoesNotReturn500()
    {
        var response = await _client.GetAsync($"/api/v1/jobs/{Guid.NewGuid()}");

        Assert.True(
            response.StatusCode == HttpStatusCode.OK ||
            response.StatusCode == HttpStatusCode.NotFound,
            $"Expected 200 or 404 but got {(int)response.StatusCode}.");
    }

    // TEST 9: Does the response for a single job include an ETag header?
    // ETag is a fingerprint of the resource — clients use it for caching.
    // Step 1: get a real job ID from the list endpoint
    // Step 2: fetch that specific job and check the ETag header is present
    [Fact]
    public async Task GetJobById_ResponseIncludesETagHeader()
    {
        // Step 1: grab the first job from the list so we have a real ID
        var listResponse = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=1");
        listResponse.EnsureSuccessStatusCode();

        var body  = await listResponse.Content.ReadAsStringAsync();
        var paged = JsonSerializer.Deserialize<PagedResponse<JobResponse>>(body, _json);

        var firstJob = paged?.Data.FirstOrDefault();
        if (firstJob is null)
            return; // no seed data — skip silently rather than fail

        // Step 2: fetch that specific job
        var response = await _client.GetAsync($"/api/v1/jobs/{firstJob.Id}");
        response.EnsureSuccessStatusCode();

        // The ETag header must be present and not empty
        Assert.True(response.Headers.ETag is not null,
            "Expected ETag response header to be present.");
        Assert.False(string.IsNullOrWhiteSpace(response.Headers.ETag?.Tag),
            "Expected ETag value to be non-empty.");
    }

    // TEST 10: The full ETag caching round-trip.
    // Step 1: fetch a job and capture its ETag
    // Step 2: send a second request with If-None-Match: {etag}
    // Step 3: server should return 304 Not Modified — meaning
    //         "the resource hasn't changed, use your cached version"
    // This proves the ETag logic in the controller actually works end to end.
    [Fact]
    public async Task GetJobById_WithMatchingETag_Returns304()
    {
        // Step 1: get a real job ID
        var listResponse = await _client.GetAsync("/api/v1/jobs?page=1&pageSize=1");
        listResponse.EnsureSuccessStatusCode();

        var body  = await listResponse.Content.ReadAsStringAsync();
        var paged = JsonSerializer.Deserialize<PagedResponse<JobResponse>>(body, _json);

        var firstJob = paged?.Data.FirstOrDefault();
        if (firstJob is null)
            return; // no seed data — skip silently

        // Step 2: fetch the job and grab its ETag
        var first = await _client.GetAsync($"/api/v1/jobs/{firstJob.Id}");
        first.EnsureSuccessStatusCode();

        var etag = first.Headers.ETag?.ToString();
        Assert.NotNull(etag);

        // Step 3: send a new request with the ETag we just received
        // If-None-Match tells the server "I already have this version"
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/jobs/{firstJob.Id}");
        request.Headers.TryAddWithoutValidation("If-None-Match", etag);

        var second = await _client.SendAsync(request);

        // Server must say "nothing changed, use your cache"
        Assert.Equal(HttpStatusCode.NotModified, second.StatusCode);
    }
}