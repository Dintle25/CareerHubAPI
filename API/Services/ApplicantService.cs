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
