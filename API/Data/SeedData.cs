// using API.Models;
// using Microsoft.EntityFrameworkCore;

// namespace API.Data;

// public static class SeedData
// {
//     public static async Task SeedAsync(CareerHubDbContext db)
//     {


//         if (await db.Companies.AnyAsync())
//             return;
         
//           var company = new Company
//         {
//             Id = Guid.NewGuid(),
//             Name = "Default Company",
//             Description = "Seed company"
//         };

//         db.Companies.Add(company);
//         await db.SaveChangesAsync();

//         // Sample jobs for testing and demonstrations.
//         var jobs = new List<Job>
//         {
//             new Job
//             {
//                 Id = Guid.NewGuid(),
//                 Title = ".NET Developer",
//                 Description = "Build and maintain ASP.NET Core applications.",
//                 Company = "Tech Solutions",
//                 Location = "Johannesburg",
//                 Type = JobType.FullTime,
//                 PostedAt = DateTime.UtcNow,
//                 IsActive = true
//             },

//             new Job
//             {
//                 Id = Guid.NewGuid(),
//                 Title = "Frontend Developer",
//                 Description = "Develop modern web applications using React.",
//                 Company = "Web Innovations",
//                 Location = "Cape Town",
//                 Type = JobType.FullTime,
//                 PostedAt = DateTime.UtcNow,
//                 IsActive = true
//             },

//             new Job
//             {
//                 Id = Guid.NewGuid(),
//                 Title = "Database Administrator",
//                 Description = "Manage PostgreSQL databases and backups.",
//                 Company = "Data Systems",
//                 Location = "Durban",
//                 Type = JobType.FullTime,
//                 PostedAt = DateTime.UtcNow,
//                 IsActive = true
//             },

//             new Job
//             {
//                 Id = Guid.NewGuid(),
//                 Title = "Cloud Engineer",
//                 Description = "Deploy and maintain cloud infrastructure.",
//                 Company = "CloudTech",
//                 Location = "Pretoria",
//                 Type = JobType.Contract,
//                 PostedAt = DateTime.UtcNow,
//                 IsActive = true
//             },

//             new Job
//             {
//                 Id = Guid.NewGuid(),
//                 Title = "QA Tester",
//                 Description = "Test software applications and report defects.",
//                 Company = "Quality First",
//                 Location = "Johannesburg",
//                 Type = JobType.PartTime,
//                 PostedAt = DateTime.UtcNow,
//                 IsActive = true
//             }
//         };

//         // Add all sample jobs to the change tracker.
//         db.Jobs.AddRange(jobs);

//         // Save all jobs to the database.
//         await db.SaveChangesAsync();

        
//     }
// }


using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public static class SeedData
{
    public static async Task SeedAsync(CareerHubDbContext db)
    {
        if (await db.Companies.AnyAsync())
            return;

        // ---- Companies ----
        var techSolutions = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Tech Solutions",
            Description = "A software consultancy specialising in custom .NET applications."
        };

        var webInnovations = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Web Innovations",
            Description = "A digital agency building modern web experiences."
        };

        var dataSystems = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Data Systems",
            Description = "Database and data infrastructure specialists."
        };

        var cloudTech = new Company
        {
            Id = Guid.NewGuid(),
            Name = "CloudTech",
            Description = "Cloud infrastructure and DevOps consultancy."
        };

        var qualityFirst = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Quality First",
            Description = "Independent software testing and QA services."
        };

        var companies = new List<Company>
        {
            techSolutions, webInnovations, dataSystems, cloudTech, qualityFirst
        };

        // ---- Jobs ----
        var now = DateTime.UtcNow;

        var jobs = new List<Job>
        {
            new Job
            {
                Id = Guid.NewGuid(),
                Title = ".NET Developer",
                Description = "Build and maintain ASP.NET Core applications.",
                CompanyId = techSolutions.Id,
                Location = "Johannesburg",
                Type = JobType.FullTime,
                SalaryMin = 35000,
                SalaryMax = 55000,
                PostedAt = now,
                ClosingDate = now.AddDays(30),
                IsActive = true
            },
            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Backend Intern",
                Description = "Assist the backend team building internal tools.",
                CompanyId = techSolutions.Id,
                Location = "Johannesburg",
                Type = JobType.Internship,
                SalaryMin = 8000,
                SalaryMax = 12000,
                PostedAt = now,
                ClosingDate = now.AddDays(45),
                IsActive = true
            },
            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Frontend Developer",
                Description = "Develop modern web applications using React.",
                CompanyId = webInnovations.Id,
                Location = "Cape Town",
                Type = JobType.FullTime,
                SalaryMin = 32000,
                SalaryMax = 50000,
                PostedAt = now,
                ClosingDate = now.AddDays(30),
                IsActive = true
            },
            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Database Administrator",
                Description = "Manage PostgreSQL databases and backups.",
                CompanyId = dataSystems.Id,
                Location = "Durban",
                Type = JobType.FullTime,
                SalaryMin = 40000,
                SalaryMax = 60000,
                PostedAt = now,
                ClosingDate = now.AddDays(21),
                IsActive = true
            },
            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Cloud Engineer",
                Description = "Deploy and maintain cloud infrastructure.",
                CompanyId = cloudTech.Id,
                Location = "Pretoria",
                Type = JobType.Contract,
                SalaryMin = 45000,
                SalaryMax = 70000,
                PostedAt = now,
                ClosingDate = now.AddDays(60),
                IsActive = true
            },
            new Job
            {
                Id = Guid.NewGuid(),
                Title = "QA Tester",
                Description = "Test software applications and report defects.",
                CompanyId = qualityFirst.Id,
                Location = "Johannesburg",
                Type = JobType.PartTime,
                SalaryMin = 18000,
                SalaryMax = 25000,
                PostedAt = now,
                ClosingDate = now.AddDays(14),
                IsActive = true
            },
            new Job
            {
                Id = Guid.NewGuid(),
                Title = "Senior QA Tester",
                Description = "Lead test planning and mentor junior testers.",
                CompanyId = qualityFirst.Id,
                Location = "Johannesburg",
                Type = JobType.FullTime,
                SalaryMin = 30000,
                SalaryMax = 42000,
                // Closed listing — useful for testing IsActive / date filters.
                PostedAt = now.AddDays(-40),
                ClosingDate = now.AddDays(-10),
                IsActive = false
            }
        };

        // ---- Applicants ----
        var applicants = new List<Applicant>
        {
            new Applicant
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com"
            },
            new Applicant
            {
                Id = Guid.NewGuid(),
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane.smith@example.com"
            },
            new Applicant
            {
                Id = Guid.NewGuid(),
                FirstName = "Thabo",
                LastName = "Nkosi",
                Email = "thabo.nkosi@example.com"
            },
            new Applicant
            {
                Id = Guid.NewGuid(),
                FirstName = "Aisha",
                LastName = "Patel",
                Email = "aisha.patel@example.com"
            },
            new Applicant
            {
                Id = Guid.NewGuid(),
                FirstName = "Pieter",
                LastName = "van der Merwe",
                Email = "pieter.vandermerwe@example.com"
            }
        };

        // ---- Applications ----
        // Composite key is (ApplicantId, JobId) — each applicant
        // can only apply to a given job once.
        var applications = new List<Application>
        {
            new Application
            {
                ApplicantId = applicants[0].Id, // John Doe
                JobId = jobs[0].Id,              // .NET Developer
                AppliedAt = now.AddDays(-5),
                Status = ApplicationStatus.UnderReview
            },
            new Application
            {
                ApplicantId = applicants[0].Id, // John Doe
                JobId = jobs[4].Id,              // Cloud Engineer
                AppliedAt = now.AddDays(-2),
                Status = ApplicationStatus.Submitted
            },
            new Application
            {
                ApplicantId = applicants[1].Id, // Jane Smith
                JobId = jobs[2].Id,              // Frontend Developer
                AppliedAt = now.AddDays(-7),
                Status = ApplicationStatus.Shortlisted
            },
            new Application
            {
                ApplicantId = applicants[1].Id, // Jane Smith
                JobId = jobs[0].Id,              // .NET Developer
                AppliedAt = now.AddDays(-6),
                Status = ApplicationStatus.Rejected
            },
            new Application
            {
                ApplicantId = applicants[2].Id, // Thabo Nkosi
                JobId = jobs[3].Id,              // Database Administrator
                AppliedAt = now.AddDays(-3),
                Status = ApplicationStatus.Offered
            },
            new Application
            {
                ApplicantId = applicants[3].Id, // Aisha Patel
                JobId = jobs[5].Id,              // QA Tester
                AppliedAt = now.AddDays(-1),
                Status = ApplicationStatus.Submitted
            },
            new Application
            {
                ApplicantId = applicants[4].Id, // Pieter van der Merwe
                JobId = jobs[1].Id,              // Backend Intern
                AppliedAt = now.AddDays(-4),
                Status = ApplicationStatus.Rejected
            }
        };

        db.Companies.AddRange(companies);
        db.Jobs.AddRange(jobs);
        db.Applicants.AddRange(applicants);
        db.Applications.AddRange(applications);

        await db.SaveChangesAsync();
    }
}
