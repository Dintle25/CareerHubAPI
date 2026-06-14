using API.Data;
using API.Models;
using API.Repositories;
using API.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Tests.Repository;

// This is a REPOSITORY test class — it tests database queries directly
// against a real PostgreSQL database running in Docker.
// No HTTP, no controllers, no services — just the repository talking to the DB.
// IClassFixture means all tests share one Docker container instance.
public class JobListingRepositoryTests : IClassFixture<PostgreSqlContainerFixture>
{
    // Holds the connection string to our Docker PostgreSQL container
    private readonly PostgreSqlContainerFixture _fixture;

    // xUnit injects the fixture automatically before any test runs
    public JobListingRepositoryTests(PostgreSqlContainerFixture fixture)
    {
        _fixture = fixture;
    }

    // Creates a fresh DbContext (database session) for each test.
    // Migrate() ensures all tables and constraints exist before we start.
    // Each test gets its own context so they don't interfere with each other.
    private CareerHubDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<CareerHubDbContext>()
            .UseNpgsql(_fixture.ConnectionString)
            .Options;

        var context = new CareerHubDbContext(options);
        context.Database.Migrate(); // create tables if they don't exist yet
        return context;
    }

    // ── Seed helpers ─────────────────────────────────────────────────────────
    // These are just convenience methods to create test data quickly.
    // We use random GUIDs in names to avoid unique constraint violations
    // when multiple tests insert companies or jobs.

    // Creates a Company object (not saved to DB yet)
    private static Company SeedCompany() => new()
    {
        Id          = Guid.NewGuid(),
        Name        = $"Company-{Guid.NewGuid()}", // random name avoids duplicates
        Description = "Test company"
    };

    // Creates a Job object linked to a company (not saved to DB yet).
    // Optional parameters let each test customise PostedAt, IsActive, ClosingDate.
    private static Job SeedJob(
        Company company,
        DateTime? postedAt    = null,
        bool      active      = true,
        DateTime? closingDate = null) => new()
    {
        Id          = Guid.NewGuid(),
        Title       = $"Role-{Guid.NewGuid()}", // random title avoids duplicates
        Description = "Test description",
        CompanyId   = company.Id,
        Company     = company,
        Location    = "London",
        Type        = JobType.FullTime,
        IsActive    = active,
        PostedAt    = postedAt    ?? DateTime.UtcNow,
        ClosingDate = closingDate ?? DateTime.UtcNow.AddDays(30)
    };

    // Saves a company to the database and returns it.
    // Every test that needs jobs must create a company first
    // because jobs have a foreign key to companies.
    private static async Task<Company> AddCompanyAsync(CareerHubDbContext ctx)
    {
        var company = SeedCompany();
        ctx.Companies.Add(company);
        await ctx.SaveChangesAsync();
        return company;
    }

    // ── Paging tests ─────────────────────────────────────────────────────────

    // TEST 1: Does page 1 return the right number of results?
    // We seed 6 jobs, request page 1 with pageSize 4.
    // We expect: 4 items returned, 6 total, has a next page, no previous page.
    // We filter by CompanyId so jobs from other tests don't affect the count.
    [Fact]
    public async Task GetActiveListingsPagedAsync_Page1_ReturnsCorrectCount()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        // Seed 6 jobs for this company
        for (var i = 0; i < 6; i++)
            ctx.Jobs.Add(SeedJob(company));
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery { CompanyId = company.Id }; // isolate to this test's data
        var result = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 4);

        Assert.Equal(4,    result.Data.Count());   // only 4 returned on this page
        Assert.Equal(6,    result.TotalCount);     // but 6 exist in total
        Assert.True(result.HasNextPage);           // page 2 exists
        Assert.False(result.HasPreviousPage);      // nothing before page 1
    }

    // TEST 2: Does page 2 contain different jobs than page 1?
    // We seed 6 jobs and fetch both pages with pageSize 3.
    // We collect both sets of IDs and check there's no overlap.
    // This proves the Skip/Take logic in the query is working correctly.
    [Fact]
    public async Task GetActiveListingsPagedAsync_Page2_ReturnsDifferentRows()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        for (var i = 0; i < 6; i++)
            ctx.Jobs.Add(SeedJob(company));
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery();
        var page1  = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 3);
        var page2  = await repo.GetActiveListingsPagedAsync(filter, page: 2, pageSize: 3);

        // Convert both pages to sets of IDs
        var ids1 = page1.Data.Select(j => j.Id).ToHashSet();
        var ids2 = page2.Data.Select(j => j.Id).ToHashSet();

        // The intersection must be empty — no job should appear on both pages
        Assert.Empty(ids1.Intersect(ids2));
    }

    // TEST 3: Are results ordered newest first?
    // We seed 5 jobs with PostedAt spread across different days.
    // Then we check that each job's PostedAt is >= the next one in the list.
    [Fact]
    public async Task GetActiveListingsPagedAsync_ResultsAreOrderedByPostedAtDescending()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var base_ = DateTime.UtcNow;
        // Job 0 = today, Job 1 = yesterday, Job 2 = 2 days ago, etc.
        for (var i = 0; i < 5; i++)
            ctx.Jobs.Add(SeedJob(company, postedAt: base_.AddDays(-i)));
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery();
        var result = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 5);

        var dates = result.Data.Select(j => j.PostedAt).ToList();

        // Walk through the list and check each date is >= the next one
        for (var i = 0; i < dates.Count - 1; i++)
            Assert.True(dates[i] >= dates[i + 1],
                $"Expected descending order but {dates[i]} < {dates[i + 1]} at index {i}");
    }

    // TEST 4: Are inactive/expired listings excluded from results?
    // We seed 3 active jobs and 2 inactive jobs with past closing dates.
    // The query filters on IsActive = true, so only 3 should come back.
    [Fact]
    public async Task GetActiveListingsPagedAsync_ExcludesExpiredListings()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        // 3 active jobs with future closing dates — should be returned
        for (var i = 0; i < 3; i++)
            ctx.Jobs.Add(SeedJob(company, closingDate: DateTime.UtcNow.AddDays(30)));

        // 2 inactive jobs with past closing dates — should NOT be returned.
        // PostedAt must be before ClosingDate to satisfy the DB check constraint.
        for (var i = 0; i < 2; i++)
        {
            var job = SeedJob(company, active: false);
            job.PostedAt    = DateTime.UtcNow.AddDays(-10); // posted 10 days ago
            job.ClosingDate = DateTime.UtcNow.AddDays(-1);  // closed yesterday
            ctx.Jobs.Add(job);
        }

        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var filter = new JobListingFilterQuery { CompanyId = company.Id };
        var result = await repo.GetActiveListingsPagedAsync(filter, page: 1, pageSize: 20);

        // Only the 3 active jobs should appear
        Assert.Equal(3, result.TotalCount);
    }

    // ── Check constraint tests ────────────────────────────────────────────────

    // TEST 5: Does the database reject a job where SalaryMax < SalaryMin?
    // This bypasses all service logic and inserts directly via DbContext.
    // The DB check constraint must catch it and throw an exception.
    // This proves the rule is enforced at the database level, not just in code.
    [Fact]
    public async Task CheckConstraint_RejectsSalaryMaxLessThanSalaryMin()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var job = SeedJob(company);
        job.SalaryMin = 80_000; // min is higher than max — invalid
        job.SalaryMax = 50_000;
        ctx.Jobs.Add(job);

        // SaveChangesAsync must throw — the DB constraint fires
        await Assert.ThrowsAnyAsync<Exception>(
            () => ctx.SaveChangesAsync());
    }

    // TEST 6: Does the database reject a job where ClosingDate is before PostedAt?
    // Same idea — bypasses service logic and tests the DB constraint directly.
    [Fact]
    public async Task CheckConstraint_RejectsClosingDateBeforePostedAt()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var job = SeedJob(company);
        job.PostedAt    = DateTime.UtcNow;
        job.ClosingDate = DateTime.UtcNow.AddDays(-1); // closes before it was posted — invalid
        ctx.Jobs.Add(job);

        // SaveChangesAsync must throw — the DB constraint fires
        await Assert.ThrowsAnyAsync<Exception>(
            () => ctx.SaveChangesAsync());
    }

    // ── Full-text search tests ────────────────────────────────────────────────

    // TEST 7: Does searching "engineer" find a job titled "Software Engineering Position"?
    // This tests PostgreSQL's full-text search stemming — "engineer" and "Engineering"
    // share the same root word (stem), so they match.
    // A simple LIKE '%engineer%' would fail on "Engineering" without case-insensitivity,
    // but full-text search handles this natively.
    [Fact]
    public async Task SearchAsync_ReturnsStemmedMatches()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        var job = SeedJob(company);
        job.Title = "Software Engineering Position"; // contains "Engineering" not "engineer"
        ctx.Jobs.Add(job);
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var result = await repo.SearchAsync("engineer"); // search with stemmed form

        // The job must appear in results despite the different word form
        Assert.Contains(result, j => j.Id == job.Id);
    }

    // TEST 8: Does search return ONLY matching jobs and exclude non-matching ones?
    // We seed 2 jobs with "engineer" in the title and 2 without.
    // We assert the 2 matches are returned and the 2 non-matches are not.
    [Fact]
    public async Task SearchAsync_DoesNotReturnNonMatchingListings()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        // These two should be found
        var matching1 = SeedJob(company);
        matching1.Title = "Senior Engineer Role";
        var matching2 = SeedJob(company);
        matching2.Title = "Engineering Manager";

        // These two should NOT be found
        var nonMatch1 = SeedJob(company);
        nonMatch1.Title = "Product Designer";
        var nonMatch2 = SeedJob(company);
        nonMatch2.Title = "Marketing Lead";

        ctx.Jobs.AddRange(matching1, matching2, nonMatch1, nonMatch2);
        await ctx.SaveChangesAsync();

        var repo   = new JobRepository(ctx);
        var result = (await repo.SearchAsync("engineer")).ToList();

        // Exactly 2 of the results should be our matching jobs
        Assert.Equal(2, result.Count(j =>
            j.Id == matching1.Id || j.Id == matching2.Id));

        // The non-matching jobs must not appear at all
        Assert.DoesNotContain(result, j => j.Id == nonMatch1.Id);
        Assert.DoesNotContain(result, j => j.Id == nonMatch2.Id);
    }

    // ── HasApplicantAppliedAsync tests ────────────────────────────────────────

    // TEST 9: If an application exists, does HasApplicantAppliedAsync return true?
    // We seed a company, job, applicant, and application linking them together.
    // Then we call the method with those exact IDs and expect true.
    [Fact]
    public async Task HasApplicantAppliedAsync_WhenApplicationExists_ReturnsTrue()
    {
        await using var ctx = CreateContext();
        var company = await AddCompanyAsync(ctx);

        // Create and save a job
        var job = SeedJob(company);
        ctx.Jobs.Add(job);

        // Create and save an applicant with a unique email
        var applicant = new Applicant
        {
            Id        = Guid.NewGuid(),
            FirstName = "Jane",
            LastName  = "Doe",
            Email     = $"{Guid.NewGuid()}@test.com" // unique email avoids constraint violation
        };
        ctx.Applicants.Add(applicant);
        await ctx.SaveChangesAsync();

        // Create and save an application linking the applicant to the job
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

        // The application exists so this must return true
        Assert.True(result);
    }

    // TEST 10: If no application exists, does HasApplicantAppliedAsync return false?
    // We use random GUIDs that don't exist in the database.
    // The method should return false without throwing.
    [Fact]
    public async Task HasApplicantAppliedAsync_WhenNoApplicationExists_ReturnsFalse()
    {
        await using var ctx = CreateContext();

        var repo   = new ApplicationRepository(ctx);
        // Random IDs — no matching application will be found
        var result = await repo.HasApplicantAppliedAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }
}