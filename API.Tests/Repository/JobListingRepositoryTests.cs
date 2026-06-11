using API.Data;
using API.Models;
using API.Repositories;
using API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Repository;

public class JobListingRepositoryTests : IClassFixture<PostgreSqlContainerFixture>
{
    private readonly PostgreSqlContainerFixture _fixture;

    public JobListingRepositoryTests(PostgreSqlContainerFixture fixture)
    {
        _fixture = fixture;
    }


    private CareerHubDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<CareerHubDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;

        var context = new CareerHubDbContext(options);
        context.Database.Migrate();
        return context;
    }


    private static Company SeedCompany() => new()
    {
        Id          = Guid.NewGuid(),
        Name        = $"Company-{Guid.NewGuid()}",
        Description = "Test company"
    };

    private static Job SeedJob(Company company, DateTime? postedAt = null, bool active = true, DateTime? closingDate = null) => new()
    {
        Id          = Guid.NewGuid(),
        Title       = $"Role-{Guid.NewGuid()}",
        Description = "Test description",
        CompanyId   = company.Id,
        Company     = company,
        Location    = "London",
        Type        = JobType.FullTime,
        IsActive    = active,
        PostedAt    = postedAt ?? DateTime.UtcNow,
        ClosingDate = closingDate ?? DateTime.UtcNow.AddDays(30)
    };

    private static async Task<Company> AddCompanyAsync(CareerHubDbContext ctx)
    {
        var company = SeedCompany();
        ctx.Companies.Add(company);
        await ctx.SaveChangesAsync();
        return company;
    }


    [Fact]
    public async Task GetActiveListingsPagedAsync_Page1_ReturnsCorrectCount()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        for (var i = 0; i < 6; i++)
            ctx.Jobs.Add(SeedJob(company));
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery();
        var result = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 4);

        Assert.Equal(4,    result.Data.Count());
        Assert.Equal(6,    result.TotalCount);
        Assert.True(result.HasNextPage);
        Assert.False(result.HasPreviousPage);
    }

    [Fact]
    public async Task GetActiveListingsPagedAsync_Page2_ReturnsDifferentRows()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        for (var i = 0; i < 6; i++)
            ctx.Jobs.Add(SeedJob(company));
        await ctx.SaveChangesAsync();

        var repo    = new JobRepository(ctx);
        var filter  = new JobListingFilterQuery();
        var page1   = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 3);
        var page2   = await repo.GetActiveListingsPagedAsync(filter, page: 2, pageSize: 3);

        var ids1 = page1.Data.Select(j => j.Id).ToHashSet();
        var ids2 = page2.Data.Select(j => j.Id).ToHashSet();

        Assert.Empty(ids1.Intersect(ids2));
    }

    [Fact]
    public async Task GetActiveListingsPagedAsync_ResultsAreOrderedByPostedAtDescending()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var base_ = DateTime.UtcNow;
        for (var i = 0; i < 5; i++)
            ctx.Jobs.Add(SeedJob(company, postedAt: base_.AddDays(-i)));
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery();
        var result = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 5);

        var dates = result.Data.Select(j => j.PostedAt).ToList();
        for (var i = 0; i < dates.Count - 1; i++)
            Assert.True(dates[i] >= dates[i + 1],
                $"Expected descending order but {dates[i]} < {dates[i + 1]} at index {i}");
    }

    [Fact]
    public async Task GetActiveListingsPagedAsync_ExcludesExpiredListings()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        for (var i = 0; i < 3; i++)
            ctx.Jobs.Add(SeedJob(company, closingDate: DateTime.UtcNow.AddDays(30)));

        for (var i = 0; i < 2; i++)
            ctx.Jobs.Add(SeedJob(company, active: false, closingDate: DateTime.UtcNow.AddDays(-1)));

        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery();
        var result = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 20);

        Assert.Equal(3, result.TotalCount);
    }


    [Fact]
    public async Task CheckConstraint_RejectsSalaryMaxLessThanSalaryMin()
    {
       
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var job = SeedJob(company);
        job.SalaryMin = 80_000;
        job.SalaryMax = 50_000;
        ctx.Jobs.Add(job);

        await Assert.ThrowsAnyAsync<Exception>(
            () => ctx.SaveChangesAsync());
    }

    [Fact]
    public async Task CheckConstraint_RejectsClosingDateBeforePostedAt()
    {
       
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var job     = SeedJob(company);
        job.PostedAt    = DateTime.UtcNow;
        job.ClosingDate = DateTime.UtcNow.AddDays(-1); // before PostedAt

        ctx.Jobs.Add(job);

        await Assert.ThrowsAnyAsync<Exception>(
            () => ctx.SaveChangesAsync());
    }


    [Fact]
    public async Task SearchAsync_ReturnsStemmedMatches()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var job = SeedJob(company);
        job.Title = "Software Engineering Position";
        ctx.Jobs.Add(job);
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var result = await repo.SearchAsync("engineer");

        Assert.Contains(result, j => j.Id == job.Id);
    }

    [Fact]
    public async Task SearchAsync_DoesNotReturnNonMatchingListings()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        // 2 matching
        var matching1 = SeedJob(company);
        matching1.Title = "Senior Engineer Role";
        var matching2 = SeedJob(company);
        matching2.Title = "Engineering Manager";

        // 2 non-matching
        var nonMatch1 = SeedJob(company);
        nonMatch1.Title = "Product Designer";
        var nonMatch2 = SeedJob(company);
        nonMatch2.Title = "Marketing Lead";

        ctx.Jobs.AddRange(matching1, matching2, nonMatch1, nonMatch2);
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var result = (await repo.SearchAsync("engineer")).ToList();

        Assert.Equal(2, result.Count(j =>
            j.Id == matching1.Id || j.Id == matching2.Id));

        Assert.DoesNotContain(result, j => j.Id == nonMatch1.Id);
        Assert.DoesNotContain(result, j => j.Id == nonMatch2.Id);
    }


    [Fact]
    public async Task HasApplicantAppliedAsync_WhenApplicationExists_ReturnsTrue()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);
        var job     = SeedJob(company);
        ctx.Jobs.Add(job);

        var applicant = new Applicant
        {
            Id        = Guid.NewGuid(),
            FirstName = "Jane",
            LastName  = "Doe",
            Email     = $"{Guid.NewGuid()}@test.com"
        };
        ctx.Applicants.Add(applicant);
        await ctx.SaveChangesAsync();

        var application = new Application
        {
            ApplicantId = applicant.Id,
            JobId       = job.Id,
            Status      = ApplicationStatus.Submitted,
            AppliedAt   = DateTime.UtcNow
        };
        ctx.Applications.Add(application);
        await ctx.SaveChangesAsync();

        var repo   = new ApplicationRepository(ctx);
        var result = await repo.HasApplicantAppliedAsync(applicant.Id, job.Id);

        Assert.True(result);
    }

    [Fact]
    public async Task HasApplicantAppliedAsync_WhenNoApplicationExists_ReturnsFalse()
    {
        await using var ctx = CreateContext();

        var repo   = new ApplicationRepository(ctx);
        var result = await repo.HasApplicantAppliedAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }
}