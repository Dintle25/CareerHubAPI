// using API.Data;
// using API.DTOs;
// using API.Models;
// using Microsoft.EntityFrameworkCore;

// namespace API.Services;

// public class ApplicantService : IApplicantService
// {
//     private readonly CareerHubDbContext _context;

//     public ApplicantService(CareerHubDbContext context)
//     {
//         _context = context;
//     }

//     public async Task<IEnumerable<ApplicantResponse>> GetAllAsync()
//     {
//         return await _context.Applicants
//             .AsNoTracking()
//             .Select(a => new ApplicantResponse
//             {
//                 Id = a.Id,
//                 FirstName = a.FirstName,
//                 LastName = a.LastName,
//                 Email = a.Email
//             })
//             .ToListAsync();
//     }

//     public async Task<ApplicantResponse?> GetByIdAsync(Guid id)
//     {
//         return await _context.Applicants
//             .AsNoTracking()
//             .Where(a => a.Id == id)
//             .Select(a => new ApplicantResponse
//             {
//                 Id = a.Id,
//                 FirstName = a.FirstName,
//                 LastName = a.LastName,
//                 Email = a.Email
//             })
//             .FirstOrDefaultAsync();
//     }

//     public async Task<ApplicantResponse> CreateAsync(
//         CreateApplicantRequest request)
//     {
//         var applicant = new Applicant
//         {
//             Id = Guid.NewGuid(),
//             FirstName = request.FirstName,
//             LastName = request.LastName,
//             Email = request.Email
//         };

//         _context.Applicants.Add(applicant);

//         await _context.SaveChangesAsync();

//         return new ApplicantResponse
//         {
//             Id = applicant.Id,
//             FirstName = applicant.FirstName,
//             LastName = applicant.LastName,
//             Email = applicant.Email
//         };
//     }
// }

using API.DTOs;
using API.Models;
using API.Repositories;

namespace API.Services;

/// <summary>
/// Applicant service — no Microsoft.EntityFrameworkCore imports.
/// All data access is delegated to IApplicantRepository.
/// </summary>
public class ApplicantService(IApplicantRepository applicantRepository) : IApplicantService
{
    public async Task<IEnumerable<ApplicantResponse>> GetAllAsync()
    {
        return await applicantRepository.GetAllAsync();
    }

    public async Task<ApplicantResponse?> GetByIdAsync(Guid id)
    {
        var applicant = await applicantRepository.GetByIdAsync(id);

        if (applicant is null)
            return null;

        return new ApplicantResponse
        {
            Id = applicant.Id,
            FirstName = applicant.FirstName,
            LastName = applicant.LastName,
            Email = applicant.Email
        };
    }

    public async Task<ApplicantResponse> CreateAsync(CreateApplicantRequest request)
    {
        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email
        };

        return await applicantRepository.AddAsync(applicant);
    }
}
