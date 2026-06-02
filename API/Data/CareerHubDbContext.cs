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
    public DbSet<Job> JobListings => Set<Job>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure the JobListing entity
        modelBuilder.Entity<Job>(entity =>
        {
            // Map to a lowercase PostgreSQL table name
            entity.ToTable("joblistings");

            // Configure the primary key
            entity.HasKey(j => j.Id);

            // The application generates the Guid
            entity.Property(j => j.Id)
                .ValueGeneratedNever();

            // Job title is required and limited in length
            entity.Property(j => j.Title)
                .IsRequired()
                .HasMaxLength(100);

            // Company name is required and limited in length
            entity.Property(j => j.Company)
                .IsRequired()
                .HasMaxLength(100);

            // Description is required and limited in length
            entity.Property(j => j.Description)
                .IsRequired()
                .HasMaxLength(2000);

            // Location is required and limited in length
            entity.Property(j => j.Location)
                .IsRequired()
                .HasMaxLength(100);

            // Prevent duplicate jobs for the same company
            entity.HasIndex(j => new
            {
                j.Title,
                j.Company
            })
            .IsUnique();
        });
    }
}