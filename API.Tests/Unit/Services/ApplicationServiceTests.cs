using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;
using API.Services;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace API.Tests.Unit.Services;

// This is a UNIT test class for ApplicationService.
// It tests the status transition logic in complete isolation —
// no real database, no HTTP, no other services.
// Every dependency is replaced with a fake (substitute) using NSubstitute.
public class ApplicationServiceTests
{
    // These are the FAKE versions of the dependencies.
    // NSubstitute creates them — they don't actually do anything
    // unless we tell them what to return.
    private readonly IApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IApplicantRepository _applicantRepository;

    // This is the REAL class we are testing (sut = System Under Test)
    private readonly ApplicationService _sut;

    // The constructor runs before every single test.
    // We create fresh fakes each time so no test can affect another.
    public ApplicationServiceTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _jobRepository         = Substitute.For<IJobRepository>();
        _applicantRepository   = Substitute.For<IApplicantRepository>();

        // Give the real service the fake dependencies
        _sut = new ApplicationService(
            _applicationRepository,
            _jobRepository,
            _applicantRepository);
    }

    // Helper method that creates a fake Application object in any given status.
    // We populate Applicant and Job navigation properties because
    // MapToResponse in the service reads their names — without them it would crash.
    private static Application BuildApplication(ApplicationStatus status) => new()
    {
        Id          = Guid.NewGuid(),
        ApplicantId = Guid.NewGuid(),
        JobId       = Guid.NewGuid(),
        Status      = status,
        AppliedAt   = DateTime.UtcNow,
        Applicant   = new Applicant { FirstName = "Jane", LastName = "Doe" },
        Job         = new Job { Title = "Software Engineer" }
    };

    // ── Legal transition tests ────────────────────────────────────────────────

    // TEST 1: Does a legal status transition actually save to the database?
    // [Theory] with [InlineData] runs this ONE test method 5 times,
    // once for each valid From → To pair in the transition matrix.
    // For each case we check that UpdateApplicationStatusAsync was called exactly once.
    [Theory]
    [InlineData(ApplicationStatus.Submitted,   ApplicationStatus.UnderReview)] // run 1
    [InlineData(ApplicationStatus.UnderReview, ApplicationStatus.Shortlisted)] // run 2
    [InlineData(ApplicationStatus.UnderReview, ApplicationStatus.Rejected)]    // run 3
    [InlineData(ApplicationStatus.Shortlisted, ApplicationStatus.Offered)]     // run 4
    [InlineData(ApplicationStatus.Shortlisted, ApplicationStatus.Rejected)]    // run 5
    public async Task UpdateAsync_WhenTransitionIsLegal_CallsUpdateApplicationStatusAsync(
        ApplicationStatus from, // the current status
        ApplicationStatus to)   // the new status we want to move to
    {
        // Arrange: create an application in the "from" state
        var application = BuildApplication(from);

        // Tell the fake repository: when asked for this application, return it
        _applicationRepository
            .GetApplicationAsync(application.ApplicantId, application.JobId)
            .Returns(application);

        // Tell the fake repository: when the status update is called, return
        // a new application object with the updated status
        _applicationRepository
            .UpdateApplicationStatusAsync(application.ApplicantId, application.JobId, to)
            .Returns(new Application
            {
                ApplicantId = application.ApplicantId,
                JobId       = application.JobId,
                Status      = to,
                AppliedAt   = application.AppliedAt,
                Applicant   = application.Applicant,
                Job         = application.Job
            });

        var request = new UpdateApplicationRequest { Status = to };

        // Act: call the real service method
        await _sut.UpdateAsync(application.ApplicantId, application.JobId, request);

        // Assert: the repository's update method must have been called exactly once
        // with the correct applicantId, jobId and new status
        await _applicationRepository
            .Received(1)
            .UpdateApplicationStatusAsync(application.ApplicantId, application.JobId, to);
    }

    // ── Illegal transition tests ──────────────────────────────────────────────

    // TEST 2: Does an illegal status transition throw the right exception
    // and NOT save anything to the database?
    // Again uses [Theory] — runs 4 times, once per illegal transition.
    // Rejected and Offered are terminal states — nothing can come after them.
    [Theory]
    [InlineData(ApplicationStatus.Rejected, ApplicationStatus.Submitted)]   // can't un-reject
    [InlineData(ApplicationStatus.Offered,  ApplicationStatus.Submitted)]   // can't un-offer
    [InlineData(ApplicationStatus.Rejected, ApplicationStatus.UnderReview)] // can't reopen rejected
    [InlineData(ApplicationStatus.Offered,  ApplicationStatus.Shortlisted)] // can't go back
    public async Task UpdateAsync_WhenTransitionIsIllegal_ThrowsInvalidStatusTransitionException(
        ApplicationStatus from,
        ApplicationStatus to)
    {
        // Arrange: application is already in a terminal state
        var application = BuildApplication(from);

        _applicationRepository
            .GetApplicationAsync(application.ApplicantId, application.JobId)
            .Returns(application);

        var request = new UpdateApplicationRequest { Status = to };

        // Act: wrap the call so we can assert it throws
        var act = () => _sut.UpdateAsync(application.ApplicantId, application.JobId, request);

        // Assert: must throw InvalidStatusTransitionException
        var ex = await Assert.ThrowsAsync<InvalidStatusTransitionException>(act);

        // The exception must record exactly which transition was attempted
        Assert.Equal(from, ex.Current);
        Assert.Equal(to,   ex.Attempted);

        // The database update must NEVER have been called —
        // invalid transitions must be rejected before touching the database
        await _applicationRepository
            .DidNotReceive()
            .UpdateApplicationStatusAsync(
                Arg.Any<Guid>(),
                Arg.Any<Guid>(),
                Arg.Any<ApplicationStatus>());
    }

    // ── Not found test ────────────────────────────────────────────────────────

    // TEST 3: What happens if the application doesn't exist?
    // We tell the fake repository to return null (application not found).
    // The service must throw an exception and must NOT attempt a database update.
    [Fact]
    public async Task UpdateAsync_WhenApplicationNotFound_ThrowsException()
    {
        // Arrange: the repository returns null — application doesn't exist
        _applicationRepository
            .GetApplicationAsync(Arg.Any<Guid>(), Arg.Any<Guid>())
            .ReturnsNull();

        var request = new UpdateApplicationRequest { Status = ApplicationStatus.UnderReview };

        // Act
        var act = () => _sut.UpdateAsync(Guid.NewGuid(), Guid.NewGuid(), request);

        // Assert: any exception is acceptable here since the service throws
        // a plain Exception("Application not found") — not a typed one yet
        await Assert.ThrowsAsync<Exception>(act);

        // The database update must never be called when the application isn't found
        await _applicationRepository
            .DidNotReceive()
            .UpdateApplicationStatusAsync(
                Arg.Any<Guid>(),
                Arg.Any<Guid>(),
                Arg.Any<ApplicationStatus>());
    }
}