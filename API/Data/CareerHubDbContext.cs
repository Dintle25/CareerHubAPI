// EF Core database functionality
using API.Models;
using Microsoft.EntityFrameworkCore;

// Entity models

namespace API.Data;

// Represents the database session and unit of work
public class CareerHubDbContext(
    DbContextOptions<CareerHubDbContext> options)
    : DbContext(options)
{
    // Represents the JobListings table
    // Jobs table
    public DbSet<Job> Jobs => Set<Job>();

    // Companies table
    public DbSet<Company> Companies => Set<Company>();

    // Applicants table
    public DbSet<Applicant> Applicants => Set<Applicant>();

    // Applications table
    public DbSet<Application> Applications => Set<Application>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {

       modelBuilder.HasDefaultSchema("public");

        modelBuilder.Entity<Company>(entity =>
   {
       // PostgreSQL table name
       entity.ToTable("companies");

       // Primary key
       entity.HasKey(c => c.Id);

       // Application creates the Guid
       entity.Property(c => c.Id)
           .ValueGeneratedNever();

       // Company name is required
       entity.Property(c => c.Name)
           .IsRequired()
           .HasMaxLength(100);

       // Company description is required
       entity.Property(c => c.Description)
           .IsRequired()
           .HasMaxLength(1000);

       // Prevent duplicate company names
       entity.HasIndex(c => c.Name)
           .IsUnique();
   });


//         modelBuilder.Entity<Applicant>(entity =>
//    {
//        entity.ToTable("applicants");

//        entity.HasKey(a => a.Id);

//        entity.Property(a => a.Id)
//            .ValueGeneratedNever();

//        entity.Property(a => a.FirstName)
//            .IsRequired()
//            .HasMaxLength(100);

//        entity.Property(a => a.LastName)
//            .IsRequired()
//            .HasMaxLength(100);

//        entity.Property(a => a.Email)
//            .IsRequired()
//            .HasMaxLength(255);

//        // Prevent duplicate emails
//        entity.HasIndex(a => a.Email)
//            .IsUnique();
//    });



       modelBuilder.Entity<Applicant>(entity =>
{
    entity.ToTable("applicants");
    entity.HasKey(a => a.Id);
    entity.Property(a => a.Id).ValueGeneratedNever();
    entity.Property(a => a.FirstName).IsRequired().HasMaxLength(100);
    entity.Property(a => a.LastName).IsRequired().HasMaxLength(100);
    entity.Property(a => a.Email).IsRequired().HasMaxLength(255);
    entity.HasIndex(a => a.Email).IsUnique();

    // Store the hashed password — never plain text
    entity.Property(a => a.PasswordHash).IsRequired().HasMaxLength(255);
});

modelBuilder.Entity<Application>(entity =>
{
    entity.ToTable("applications");

    // Single primary key — replaced the old composite ApplicantId + JobId key
    entity.HasKey(a => a.Id);
    entity.Property(a => a.Id).ValueGeneratedNever();

    entity.Property(a => a.FullName).IsRequired().HasMaxLength(100);
    entity.Property(a => a.Email).IsRequired().HasMaxLength(255);
    entity.Property(a => a.Phone).HasMaxLength(20);
    entity.Property(a => a.CoverLetter).IsRequired().HasMaxLength(2000);
    entity.Property(a => a.LinkedInUrl).HasMaxLength(255);

    // Job FK only — Applicant FK removed
    entity.HasOne(a => a.Job)
        .WithMany(j => j.Applications)
        .HasForeignKey(a => a.JobId)
        .OnDelete(DeleteBehavior.Cascade);
});



        modelBuilder.Entity<Job>(entity =>
        {

            entity.ToTable("jobs", t =>
            {
                t.HasCheckConstraint(
            "CK_jobs_salary_range",
            "\"SalaryMin\" IS NULL OR \"SalaryMax\" IS NULL OR \"SalaryMax\" >= \"SalaryMin\"");

                t.HasCheckConstraint(
        "CK_jobs_closing_after_posted",
        "\"ClosingDate\" > \"PostedAt\"");
            });

            entity.ToTable("jobs");

            entity.HasKey(j => j.Id);

            entity.Property(j => j.Id)
                .ValueGeneratedNever();

            entity.Property(j => j.Title)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(j => j.Description)
                .IsRequired()
                .HasMaxLength(2000);

            entity.Property(j => j.Location)
                .IsRequired()
                .HasMaxLength(100);

            // One Company -> Many Jobs
            entity.HasOne(j => j.Company)
                .WithMany(c => c.Jobs)
                .HasForeignKey(j => j.CompanyId)

                // Prevent deleting a company
                // while jobs still exist
                .OnDelete(DeleteBehavior.Restrict);

            entity.Property(j => j.ClosingDate)
              .IsRequired();

            // Prevent duplicate job titles
            // within the same company
            entity.HasIndex(j => new
            {
                j.Title,
                j.CompanyId
            })
            .IsUnique();



        });


        // modelBuilder.Entity<Application>(entity =>
        // {
        //     entity.ToTable("applications");

        //     // Composite primary key
        //     entity.HasKey(a => new
        //     {
        //         a.ApplicantId,
        //         a.JobId
        //     });

        //     // Relationship to Applicant
        //     entity.HasOne(a => a.Applicant)
        //         .WithMany(a => a.Applications)
        //         .HasForeignKey(a => a.ApplicantId)
        //         .OnDelete(DeleteBehavior.Cascade);

        //     // Relationship to Job
        //     entity.HasOne(a => a.Job)
        //         .WithMany(j => j.Applications)
        //         .HasForeignKey(a => a.JobId)
        //         .OnDelete(DeleteBehavior.Cascade);
        // });


//         modelBuilder.Entity<Application>(entity =>
// {
//     entity.ToTable("applications");

//     // Primary key
//     entity.HasKey(a => a.Id);

//     entity.Property(a => a.Id)
//         .ValueGeneratedNever();

//     entity.Property(a => a.FullName)
//         .IsRequired()
//         .HasMaxLength(200);

//     entity.Property(a => a.Email)
//         .IsRequired()
//         .HasMaxLength(255);

//     entity.Property(a => a.Phone)
//         .HasMaxLength(30);

//     entity.Property(a => a.CoverLetter)
//         .IsRequired();

//     entity.Property(a => a.LinkedInUrl)
//         .HasMaxLength(500);

//     // Relationship to Job
//     entity.HasOne(a => a.Job)
//         .WithMany(j => j.Applications)
//         .HasForeignKey(a => a.JobId)
//         .OnDelete(DeleteBehavior.Cascade);
// });


//     }
//     // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//     // {
//     //     optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);
//     // }
 }}