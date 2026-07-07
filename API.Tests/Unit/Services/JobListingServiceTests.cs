using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;
using API.Services;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace API.Tests.Unit.Services;

// This is a UNIT test class for JobService.
// It tests the business logic in JobService in complete isolation —
// no real database, no HTTP requests, nothing external.
// Every dependency is replaced with a fake using NSubstitute.
public class JobServiceTests
{
    // Fake versions of the two dependencies JobService needs.
    // They don't hit a real database — we control exactly what they return.
    private readonly IJobRepository _jobRepository;
    private readonly ICompanyRepository _companyRepository;

    // The REAL class we are testing (sut = System Under Test)
    private readonly JobService _sut;

    // Runs before every single test — creates fresh fakes each time.
    // This means no test can accidentally affect another through shared state.
    public JobServiceTests()
    {
        _jobRepository     = Substitute.For<IJobRepository>();
        _companyRepository = Substitute.For<ICompanyRepository>();

        // Give the real service the fake dependencies
        _sut = new JobService(_jobRepository, _companyRepository);
    }

    // ── CreateAsync tests ─────────────────────────────────────────────────────

    // TEST 1: Does CreateAsync reject a request where SalaryMax < SalaryMin?
    // We give it a valid company but invalid salary range.
    // The service must throw InvalidSalaryException and must NOT save to the database.
    [Fact]
    public async Task CreateAsync_WhenSalaryMaxLessThanSalaryMin_ThrowsInvalidSalaryException()
    {
        // Tell the fake company repository to return a valid company
        // so the test gets past the "company must exist" check
        // and reaches the salary validation
        _companyRepository
            .GetByIdAsync(Arg.Any<Guid>())
            .Returns(new CompanyResponse { Id = Guid.NewGuid(), Name = "Acme" });

        // SalaryMin 80k is higher than SalaryMax 50k — this is invalid
        var request = new CreateJobRequest
        {
            CompanyId   = Guid.NewGuid(),
            Title       = "Engineer",
            Description = "desc",
            Location    = "London",
            Type        = JobType.FullTime,
            ClosingDate = DateTime.UtcNow.AddDays(30),
            SalaryMin   = 80_000,
            SalaryMax   = 50_000
        };

        var act = () => _sut.CreateAsync(request);

        // Must throw before saving anything
        await Assert.ThrowsAsync<InvalidSalaryException>(act);

        // The database write must never have been called
        await _jobRepository.DidNotReceive().AddListingAsync(Arg.Any<Job>());
    }

    // TEST 2: Does CreateAsync reject a request with a closing date in the past?
    // A job that closes yesterday can't be posted today.
    // Must throw ListingClosedException and must NOT save to the database.
    [Fact]
    public async Task CreateAsync_WhenExpiresAtIsInThePast_ThrowsListingClosedException()
    {
        // Company is valid — we need to get past the company check
        // to reach the closing date check
        _companyRepository
            .GetByIdAsync(Arg.Any<Guid>())
            .Returns(new CompanyResponse { Id = Guid.NewGuid(), Name = "Acme" });

        // ClosingDate is yesterday — already in the past
        var request = new CreateJobRequest
        {
            CompanyId   = Guid.NewGuid(),
            Title       = "Engineer",
            Description = "desc",
            Location    = "London",
            Type        = JobType.FullTime,
            ClosingDate = DateTime.UtcNow.AddDays(-1)
        };

        var act = () => _sut.CreateAsync(request);

        // Must throw before saving anything
        await Assert.ThrowsAsync<ListingClosedException>(act);

        // The database write must never have been called
        await _jobRepository.DidNotReceive().AddListingAsync(Arg.Any<Job>());
    }

    // TEST 3: Does CreateAsync save the job exactly once when everything is valid?
    // Valid company, future closing date, sensible salary range.
    // The database write must happen exactly once — not zero times, not twice.
    [Fact]
    public async Task CreateAsync_WhenValid_CallsAddListingAsyncExactlyOnce()
    {
        var companyId = Guid.NewGuid();

        // Return a valid company when asked
        _companyRepository
            .GetByIdAsync(companyId)
            .Returns(new CompanyResponse { Id = companyId, Name = "Acme" });

        var request = new CreateJobRequest
        {
            CompanyId   = companyId,
            Title       = "Engineer",
            Description = "desc",
            Location    = "London",
            Type        = JobType.FullTime,
            ClosingDate = DateTime.UtcNow.AddDays(30),
            SalaryMin   = 40_000,
            SalaryMax   = 60_000
        };

        await _sut.CreateAsync(request);

        // Received(1) means "this method was called exactly once"
        await _jobRepository.Received(1).AddListingAsync(Arg.Any<Job>());
    }

    // ── PatchAsync tests ──────────────────────────────────────────────────────

    // TEST 4: What happens if we try to patch a job that doesn't exist?
    // The repository returns null — the service must throw JobNotFoundException
    // and must NOT attempt a database update.
    [Fact]
    public async Task PatchAsync_WhenListingNotFound_ThrowsJobNotFoundException()
    {
        // Tell the fake repository: this job doesn't exist
        _jobRepository
            .GetEntityByIdAsync(Arg.Any<Guid>())
            .ReturnsNull();

        var request = new UpdateJobListingRequest { Title = "New Title" };

        var act = () => _sut.PatchAsync(Guid.NewGuid(), request);

        // Must throw before doing anything else
        await Assert.ThrowsAsync<JobNotFoundException>(act);

        // Must not try to update something that doesn't exist
        await _jobRepository.DidNotReceive().UpdateListingAsync(Arg.Any<Job>());
    }

    // TEST 5: What if we only change SalaryMin to a value higher than the existing SalaryMax?
    // The job currently has SalaryMin=40k, SalaryMax=60k.
    // We request SalaryMin=80k — this would make min higher than max, which is invalid.
    // The service must calculate the effective range and throw InvalidSalaryException.
    // The database must NOT be updated.
    [Fact]
    public async Task PatchAsync_WhenOnlySalaryMinChangedAndExceedsExistingMax_ThrowsInvalidSalaryException()
    {
        // Set up an existing job with a valid salary range
        var existingJob = new Job
        {
            Id        = Guid.NewGuid(),
            Title     = "Engineer",
            SalaryMin = 40_000,
            SalaryMax = 60_000
        };

        // Tell the fake repository to return this job when asked
        _jobRepository
            .GetEntityByIdAsync(existingJob.Id)
            .Returns(existingJob);

        // Only SalaryMin is being changed — SalaryMax stays at 60k.
        // 80k min > 60k max = invalid
        var request = new UpdateJobListingRequest { SalaryMin = 80_000 };

        var act = () => _sut.PatchAsync(existingJob.Id, request);

        // The service must detect the invalid range and throw
        await Assert.ThrowsAsync<InvalidSalaryException>(act);

        // Must not save the invalid state to the database
        await _jobRepository.DidNotReceive().UpdateListingAsync(Arg.Any<Job>());
    }

    // TEST 6: Does a valid patch that only changes the title save exactly once?
    // No salary fields are touched so no salary validation should run.
    // This proves the happy path works and that salary validation
    // doesn't interfere when salary fields aren't included in the request.
    [Fact]
    public async Task PatchAsync_WhenOnlyTitleChanged_CallsUpdateListingAsyncExactlyOnce()
    {
        // Set up an existing job — Company and Applications must be populated
        // because MapToResponse reads them at the end of PatchAsync
        var existingJob = new Job
        {
            Id           = Guid.NewGuid(),
            Title        = "Old Title",
            SalaryMin    = 40_000,
            SalaryMax    = 60_000,
            Company      = new Company { Name = "Acme" },
            Applications = []
        };

        _jobRepository
            .GetEntityByIdAsync(existingJob.Id)
            .Returns(existingJob);

        // Only Title is set — SalaryMin and SalaryMax are null (not being changed)
        var request = new UpdateJobListingRequest { Title = "New Title" };

        await _sut.PatchAsync(existingJob.Id, request);

        // The database update must have been called exactly once with the same job object
        await _jobRepository.Received(1).UpdateListingAsync(existingJob);
    }
}