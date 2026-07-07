using API.DTOs;

namespace API.Services;

public interface IApplicantService
{
    Task<IEnumerable<ApplicantResponse>> GetAllAsync();
    Task<ApplicantResponse?> GetByIdAsync(Guid id);
    Task<ApplicantResponse> CreateAsync(CreateApplicantRequest request);
}