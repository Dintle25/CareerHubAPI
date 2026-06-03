using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class SeedData
{
    public static async Task SeedAsync(CareerHubDbContext db)
    {
     
        if (await db.Jobs.AnyAsync())
            return;

        // Sample jobs for testing and demonstrations.
        var jobs = new List<Job>
        {
            new Job
            {
                Id = Guid.NewGuid(),
                Title = ".NET Developer",
                Description = "Build and maintain ASP.NET Core applications.",
                Company = "Tech Solutions",
                Location = "Johannesburg",
                Type = JobType.FullTime,
                PostedAt = DateTime.UtcNow,
                IsActive = true
            },

            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Frontend Developer",
                Description = "Develop modern web applications using React.",
                Company = "Web Innovations",
                Location = "Cape Town",
                Type = JobType.FullTime,
                PostedAt = DateTime.UtcNow,
                IsActive = true
            },

            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Database Administrator",
                Description = "Manage PostgreSQL databases and backups.",
                Company = "Data Systems",
                Location = "Durban",
                Type = JobType.FullTime,
                PostedAt = DateTime.UtcNow,
                IsActive = true
            },

            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Cloud Engineer",
                Description = "Deploy and maintain cloud infrastructure.",
                Company = "CloudTech",
                Location = "Pretoria",
                Type = JobType.Contract,
                PostedAt = DateTime.UtcNow,
                IsActive = true
            },

            new Job
            {
                Id = Guid.NewGuid(),
                Title = "QA Tester",
                Description = "Test software applications and report defects.",
                Company = "Quality First",
                Location = "Johannesburg",
                Type = JobType.PartTime,
                PostedAt = DateTime.UtcNow,
                IsActive = true
            }
        };

        // Add all sample jobs to the change tracker.
        db.Jobs.AddRange(jobs);

        // Save all jobs to the database.
        await db.SaveChangesAsync();
    }
}