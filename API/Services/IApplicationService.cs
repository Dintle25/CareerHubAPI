// using API.DTOs;

// namespace API.Services;


// public interface IApplicationService
// {
//     Task<IEnumerable<ApplicationResponse>> GetAllAsync();

//     Task<ApplicationResponse?> GetByIdAsync(
//         Guid applicantId,
//         Guid jobId);

//     Task<ApplicationResponse> CreateAsync(
//         CreateApplicationRequest request);

//         Task<ApplicationResponse?> UpdateAsync(
//         Guid applicantId,
//         Guid jobId,
//         UpdateApplicationRequest request);

//     Task<bool> DeleteAsync(
//         Guid applicantId,
//         Guid jobId);
// }

using API.DTOs;

namespace API.Services;

public interface IApplicationService
{
    Task<IEnumerable<ApplicationResponse>> GetAllAsync();

    Task<ApplicationResponse?> GetByIdAsync(
        Guid applicantId,
        Guid jobId);

    Task<ApplicationResponse> CreateAsync(
        CreateApplicationRequest request);

    Task<ApplicationResponse> UpdateAsync(
        Guid applicantId,
        Guid jobId,
        UpdateApplicationRequest request);

    Task<bool> DeleteAsync(
        Guid applicantId,
        Guid jobId);
}