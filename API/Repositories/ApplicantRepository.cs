using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class ApplicantRepository(CareerHubDbContext context) : IApplicantRepository
{
    public async Task<IEnumerable<ApplicantResponse>> GetAllAsync()
    {
        return await context.Applicants
            .AsNoTracking()
            .Select(a => new ApplicantResponse
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Email = a.Email
            })
            .ToListAsync();
    }

    public async Task<Applicant?> GetByIdAsync(Guid id)
    {
        return await context.Applicants
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id);
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        return await context.Applicants.AnyAsync(a => a.Id == id);
    }

    public async Task<ApplicantResponse> AddAsync(Applicant applicant)
    {
        context.Applicants.Add(applicant);
        await context.SaveChangesAsync();

        return new ApplicantResponse
        {
            Id = applicant.Id,
            FirstName = applicant.FirstName,
            LastName = applicant.LastName,
            Email = applicant.Email
        };
    }
}
