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


        modelBuilder.Entity<Applicant>(entity =>
   {
       entity.ToTable("applicants");

       entity.HasKey(a => a.Id);

       entity.Property(a => a.Id)
           .ValueGeneratedNever();

       entity.Property(a => a.FirstName)
           .IsRequired()
           .HasMaxLength(100);

       entity.Property(a => a.LastName)
           .IsRequired()
           .HasMaxLength(100);

       entity.Property(a => a.Email)
           .IsRequired()
           .HasMaxLength(255);

       // Prevent duplicate emails
       entity.HasIndex(a => a.Email)
           .IsUnique();
   });







        // // Configure the JobListing entity
        // modelBuilder.Entity<Job>(entity =>
        // {
        //     // Map to a lowercase PostgreSQL table name
        //     entity.ToTable("jobs");

        //     // Configure the primary key
        //     entity.HasKey(j => j.Id);

        //     // The application generates the Guid
        //     entity.Property(j => j.Id)
        //         .ValueGeneratedNever();

        //     // Job title is required and limited in length
        //     entity.Property(j => j.Title)
        //         .IsRequired()
        //         .HasMaxLength(100);

        //     // Company name is required and limited in length
        //     entity.Property(j => j.Company)
        //         .IsRequired()
        //         .HasMaxLength(100);

        //     // Description is required and limited in length
        //     entity.Property(j => j.Description)
        //         .IsRequired()
        //         .HasMaxLength(2000);

        //     // Location is required and limited in length
        //     entity.Property(j => j.Location)
        //         .IsRequired()
        //         .HasMaxLength(100);

        //     // Prevent duplicate jobs for the same company
        //     entity.HasIndex(j => new
        //     {
        //         j.Title,
        //         j.Company
        //     })
        //     .IsUnique();
        // });


        // modelBuilder.Entity<Job>(entity =>
        // {
        //     entity.ToTable("jobs");

        //     entity.HasKey(j => j.Id);

        //     entity.Property(j => j.Id)
        //         .ValueGeneratedNever();

        //     entity.Property(j => j.Title)
        //         .IsRequired()
        //         .HasMaxLength(100);

        //     entity.Property(j => j.Description)
        //         .IsRequired()
        //         .HasMaxLength(2000);

        //     entity.Property(j => j.Location)
        //         .IsRequired()
        //         .HasMaxLength(100);

        //     // One Company -> Many Jobs
        //     entity.HasOne(j => j.Company)
        //         .WithMany(c => c.Jobs)
        //         .HasForeignKey(j => j.CompanyId)

        //         // Prevent deleting a company
        //         // while jobs still exist
        //         .OnDelete(DeleteBehavior.Restrict);

        //     entity.Property(j => j.ClosingDate)
        //       .IsRequired();

        //     // Prevent duplicate job titles
        //     // within the same company
        //     entity.HasIndex(j => new
        //     {
        //         j.Title,
        //         j.CompanyId
        //     })
        //     .IsUnique();
        // });


        modelBuilder.Entity<Job>()
    .ToTable(t =>
    {
        t.HasCheckConstraint(
            "ck_job_listings_salarymin_positive",
            "\"SalaryMin\" IS NULL OR \"SalaryMin\" > 0");

        t.HasCheckConstraint(
            "ck_job_listings_salary_range",
            "\"SalaryMin\" IS NULL OR \"SalaryMax\" IS NULL OR \"SalaryMax\" > \"SalaryMin\"");

        t.HasCheckConstraint(
            "ck_job_listings_expiry_after_created",
            "\"ExpiresAt\" > \"CreatedAt\"");
    });

        modelBuilder.Entity<Application>()
            .ToTable(t =>
            {
                t.HasCheckConstraint(
                    "ck_applications_submittedat_not_future",
                    "\"SubmittedAt\" <= CURRENT_TIMESTAMP");
            });


        modelBuilder.Entity<Application>(entity =>
        {
            entity.ToTable("applications");

            // Composite primary key
            entity.HasKey(a => new
            {
                a.ApplicantId,
                a.JobId
            });

            // Relationship to Applicant
            entity.HasOne(a => a.Applicant)
                .WithMany(a => a.Applications)
                .HasForeignKey(a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relationship to Job
            entity.HasOne(a => a.Job)
                .WithMany(j => j.Applications)
                .HasForeignKey(a => a.JobId)
                .OnDelete(DeleteBehavior.Cascade);
        });


    }
    // protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    // {
    //     optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);
    // }
}