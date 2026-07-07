// using API.DTOs;
// using API.Models;

// namespace API.Repositories;

// public interface IApplicationRepository
// {
//     Task<IEnumerable<ApplicationResponse>> GetAllAsync();

//     Task<Application?> GetByIdAsync(Guid id);

//     Task UpdateAsync(Application application);

//     Task AddAsync(Application application);

//     Task<IEnumerable<Application>> GetApplicationsForListingAsync(Guid jobId);

//     Task<bool> HasApplicationAsync(string email, Guid jobId);

//     Task<Application?> UpdateApplicationStatusAsync(
//         Guid applicationId,
//         ApplicationStatus status);

//     Task<bool> DeleteAsync(Guid applicationId);
// }


using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface IApplicationRepository
{
    Task<IEnumerable<ApplicationResponse>> GetAllAsync();
    Task<Application?> GetByIdAsync(Guid id);
    Task<Application?> GetApplicationAsync(Guid applicantId, Guid jobId); // kept for compatibility
    Task<IEnumerable<Application>> GetApplicationsForListingAsync(Guid jobId);
    Task<IEnumerable<Application>> GetApplicationsByEmailAsync(string email);
    Task<bool> HasEmailAppliedAsync(string email, Guid jobId);
    Task AddAsync(Application application);
    Task UpdateAsync(Application application);
    Task<Application?> UpdateApplicationStatusAsync(Guid id, ApplicationStatus status);
    Task<bool> DeleteAsync(Guid id);
}