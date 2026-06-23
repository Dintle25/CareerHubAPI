using API.DTOs;

namespace API.Services;

public interface IApplicationService
{
    Task<IEnumerable<ApplicationResponse>> GetAllAsync();

    Task<ApplicationResponse?> GetByIdAsync(Guid id);

    Task<ApplicationResponse> CreateAsync(
        CreateApplicationRequest request);

    Task<ApplicationResponse> UpdateStatusAsync(
        Guid id,
        UpdateApplicationStatusRequest request);

    Task<ApplicationResponse> UpdateAsync(
        Guid id,
        UpdateApplicationRequest request);

    Task<bool> DeleteAsync(Guid id);
}