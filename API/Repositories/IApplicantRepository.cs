using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface IApplicantRepository
{
    Task<IEnumerable<ApplicantResponse>> GetAllAsync();

    Task<Applicant?> GetByIdAsync(Guid id);

    Task<bool> ExistsAsync(Guid id);

    Task<ApplicantResponse> AddAsync(Applicant applicant);
}



