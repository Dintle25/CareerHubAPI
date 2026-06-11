using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;
using API.Services;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace API.Tests.Unit.Services;

public class ApplicationServiceTests
{
    private readonly IApplicationRepository _applicationRepository;
    private readonly IJobRepository _jobRepository;
    private readonly IApplicantRepository _applicantRepository;
    private readonly ApplicationService _sut;

    public ApplicationServiceTests()
    {
        _applicationRepository = Substitute.For<IApplicationRepository>();
        _jobRepository         = Substitute.For<IJobRepository>();
        _applicantRepository   = Substitute.For<IApplicantRepository>();
        _sut = new ApplicationService(
            _applicationRepository,
            _jobRepository,
            _applicantRepository);
    }


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


    [Theory]
    [InlineData(ApplicationStatus.Submitted,   ApplicationStatus.UnderReview)]
    [InlineData(ApplicationStatus.UnderReview, ApplicationStatus.Shortlisted)]
    [InlineData(ApplicationStatus.UnderReview, ApplicationStatus.Rejected)]
    [InlineData(ApplicationStatus.Shortlisted, ApplicationStatus.Offered)]
    [InlineData(ApplicationStatus.Shortlisted, ApplicationStatus.Rejected)]
    public async Task UpdateAsync_WhenTransitionIsLegal_CallsUpdateApplicationStatusAsync(
        ApplicationStatus from,
        ApplicationStatus to)
    {
        // Arrange
        var application = BuildApplication(from);

        _applicationRepository
            .GetApplicationAsync(application.ApplicantId, application.JobId)
            .Returns(application);

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

        // Act
        await _sut.UpdateAsync(application.ApplicantId, application.JobId, request);

        // Assert
        await _applicationRepository
            .Received(1)
            .UpdateApplicationStatusAsync(application.ApplicantId, application.JobId, to);
    }


    [Theory]
    [InlineData(ApplicationStatus.Rejected,  ApplicationStatus.Submitted)]
    [InlineData(ApplicationStatus.Offered,   ApplicationStatus.Submitted)]
    [InlineData(ApplicationStatus.Rejected,  ApplicationStatus.UnderReview)]
    [InlineData(ApplicationStatus.Offered,   ApplicationStatus.Shortlisted)]
    public async Task UpdateAsync_WhenTransitionIsIllegal_ThrowsInvalidStatusTransitionException(
        ApplicationStatus from,
        ApplicationStatus to)
    {
        // Arrange
        var application = BuildApplication(from);

        _applicationRepository
            .GetApplicationAsync(application.ApplicantId, application.JobId)
            .Returns(application);

        var request = new UpdateApplicationRequest { Status = to };

        // Act
        var act = () => _sut.UpdateAsync(application.ApplicantId, application.JobId, request);

        // Assert
        var ex = await Assert.ThrowsAsync<InvalidStatusTransitionException>(act);
        Assert.Equal(from, ex.Current);
        Assert.Equal(to,   ex.Attempted);
        await _applicationRepository
            .DidNotReceive()
            .UpdateApplicationStatusAsync(Arg.Any<Guid>(), Arg.Any<Guid>(), Arg.Any<ApplicationStatus>());
    }


    [Fact]
    public async Task UpdateAsync_WhenApplicationNotFound_ThrowsException()
    {
        // Arrange
        _applicationRepository
            .GetApplicationAsync(Arg.Any<Guid>(), Arg.Any<Guid>())
            .ReturnsNull();

        var request = new UpdateApplicationRequest { Status = ApplicationStatus.UnderReview };

        // Act
        var act = () => _sut.UpdateAsync(Guid.NewGuid(), Guid.NewGuid(), request);

        // Assert
        await Assert.ThrowsAsync<Exception>(act);
        await _applicationRepository
            .DidNotReceive()
            .UpdateApplicationStatusAsync(Arg.Any<Guid>(), Arg.Any<Guid>(), Arg.Any<ApplicationStatus>());
    }
}