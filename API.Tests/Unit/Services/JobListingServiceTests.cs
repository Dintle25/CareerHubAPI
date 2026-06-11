using API.DTOs;
using API.Exceptions;
using API.Models;
using API.Repositories;
using API.Services;
using NSubstitute;
using NSubstitute.ReturnsExtensions;

namespace API.Tests.Unit.Services;

public class JobServiceTests
{
    private readonly IJobRepository _jobRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly JobService _sut;

    public JobServiceTests()
    {
        _jobRepository = Substitute.For<IJobRepository>();
        _companyRepository = Substitute.For<ICompanyRepository>();
        _sut = new JobService(_jobRepository, _companyRepository);
    }


    [Fact]
    public async Task CreateAsync_WhenSalaryMaxLessThanSalaryMin_ThrowsInvalidSalaryException()
    {
        // Arrange
        _companyRepository
            .GetByIdAsync(Arg.Any<Guid>())
            .Returns(new CompanyResponse { Id = Guid.NewGuid(), Name = "Acme" });

        var request = new CreateJobRequest
        {
            CompanyId = Guid.NewGuid(),
            Title = "Engineer",
            Description = "desc",
            Location = "London",
            Type = JobType.FullTime,
            ClosingDate = DateTime.UtcNow.AddDays(30),
            SalaryMin = 80_000,
            SalaryMax = 50_000
        };

        // Act
        var act = () => _sut.CreateAsync(request);

        // Assert
        await Assert.ThrowsAsync<InvalidSalaryException>(act);
        await _jobRepository.DidNotReceive().AddListingAsync(Arg.Any<Job>());
    }

    [Fact]
    public async Task CreateAsync_WhenExpiresAtIsInThePast_ThrowsListingClosedException()
    {
        // Arrange
        _companyRepository
            .GetByIdAsync(Arg.Any<Guid>())
            .Returns(new CompanyResponse { Id = Guid.NewGuid(), Name = "Acme" });

        var request = new CreateJobRequest
        {
            CompanyId = Guid.NewGuid(),
            Title = "Engineer",
            Description = "desc",
            Location = "London",
            Type = JobType.FullTime,
            ClosingDate = DateTime.UtcNow.AddDays(-1)
        };

        // Act
        var act = () => _sut.CreateAsync(request);

        // Assert
        await Assert.ThrowsAsync<ListingClosedException>(act);
        await _jobRepository.DidNotReceive().AddListingAsync(Arg.Any<Job>());
    }

    [Fact]
    public async Task CreateAsync_WhenValid_CallsAddListingAsyncExactlyOnce()
    {
        // Arrange
        var companyId = Guid.NewGuid();

        _companyRepository
            .GetByIdAsync(companyId)
            .Returns(new CompanyResponse { Id = companyId, Name = "Acme" });

        var request = new CreateJobRequest
        {
            CompanyId = companyId,
            Title = "Engineer",
            Description = "desc",
            Location = "London",
            Type = JobType.FullTime,
            ClosingDate = DateTime.UtcNow.AddDays(30),
            SalaryMin = 40_000,
            SalaryMax = 60_000
        };

        // Act
        await _sut.CreateAsync(request);

        // Assert
        await _jobRepository.Received(1).AddListingAsync(Arg.Any<Job>());
    }


    [Fact]
    public async Task PatchAsync_WhenListingNotFound_ThrowsJobNotFoundException()
    {
        // Arrange
        _jobRepository
            .GetEntityByIdAsync(Arg.Any<Guid>())
            .ReturnsNull();

        var request = new UpdateJobListingRequest { Title = "New Title" };

        // Act
        var act = () => _sut.PatchAsync(Guid.NewGuid(), request);

        // Assert
        await Assert.ThrowsAsync<JobNotFoundException>(act);
        await _jobRepository.DidNotReceive().UpdateListingAsync(Arg.Any<Job>());
    }

    [Fact]
    public async Task PatchAsync_WhenOnlySalaryMinChangedAndExceedsExistingMax_ThrowsInvalidSalaryException()
    {
        // Arrange
        var existingJob = new Job
        {
            Id = Guid.NewGuid(),
            Title = "Engineer",
            SalaryMin = 40_000,
            SalaryMax = 60_000
        };

        _jobRepository
            .GetEntityByIdAsync(existingJob.Id)
            .Returns(existingJob);

        // SalaryMin 80k would exceed existing SalaryMax of 60k
        var request = new UpdateJobListingRequest { SalaryMin = 80_000 };

        // Act
        var act = () => _sut.PatchAsync(existingJob.Id, request);

        // Assert
        await Assert.ThrowsAsync<InvalidSalaryException>(act);
        await _jobRepository.DidNotReceive().UpdateListingAsync(Arg.Any<Job>());
    }

    [Fact]
    public async Task PatchAsync_WhenOnlyTitleChanged_CallsUpdateListingAsyncExactlyOnce()
    {
        // Arrange
        var existingJob = new Job
        {
            Id = Guid.NewGuid(),
            Title = "Old Title",
            SalaryMin = 40_000,
            SalaryMax = 60_000,
            Company = new Company { Name = "Acme" },
            Applications = []
        };

        _jobRepository
            .GetEntityByIdAsync(existingJob.Id)
            .Returns(existingJob);

        var request = new UpdateJobListingRequest { Title = "New Title" };

        // Act
        await _sut.PatchAsync(existingJob.Id, request);

        // Assert
        await _jobRepository.Received(1).UpdateListingAsync(existingJob);
    }
}