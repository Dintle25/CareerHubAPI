using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class ApplicantService : IApplicantService
{
    private readonly CareerHubDbContext _context;

    public ApplicantService(CareerHubDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ApplicantResponse>> GetAllAsync()
    {
        return await _context.Applicants
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

    public async Task<ApplicantResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Applicants
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new ApplicantResponse
            {
                Id = a.Id,
                FirstName = a.FirstName,
                LastName = a.LastName,
                Email = a.Email
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ApplicantResponse> CreateAsync(
        CreateApplicantRequest request)
    {
        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email
        };

        _context.Applicants.Add(applicant);

        await _context.SaveChangesAsync();

        return new ApplicantResponse
        {
            Id = applicant.Id,
            FirstName = applicant.FirstName,
            LastName = applicant.LastName,
            Email = applicant.Email
        };
    }
}