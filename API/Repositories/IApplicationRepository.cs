using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface IApplicationRepository
{
    Task<IEnumerable<ApplicationResponse>> GetAllAsync();

    Task<Application?> GetByIdAsync(Guid id);

    Task UpdateAsync(Application application);

    Task AddAsync(Application application);

    Task<IEnumerable<Application>> GetApplicationsForListingAsync(Guid jobId);

    Task<bool> HasApplicationAsync(string email, Guid jobId);

    Task<Application?> UpdateApplicationStatusAsync(
        Guid applicationId,
        ApplicationStatus status);

    Task<bool> DeleteAsync(Guid applicationId);
}


// using API.DTOs;
// using API.Models;

// namespace API.Repositories;

// public interface IApplicationRepository
// {
//     Task<IEnumerable<ApplicationResponse>> GetAllAsync();

//     // Task<Application?> GetApplicationAsync(
//     //     Guid applicantId,
//     //     Guid jobId);

//     // Task<bool> HasApplicantAppliedAsync(
//     //     Guid applicantId,
//     //     Guid jobId);

//     Task<Application?> GetByIdAsync(Guid id);
//     Task UpdateAsync(Application application);

//     Task<IEnumerable<Application>> GetApplicationsForListingAsync(Guid jobId);

//     //Task<IEnumerable<Application>> GetApplicationsByApplicantAsync(Guid applicantId);

//     // Named AddAsync to match existing repository implementation
//     Task AddAsync(Application application);
    

//     // Task<Application?> UpdateApplicationStatusAsync(
//     //     Guid applicantId,
//     //     Guid jobId,
//     //     ApplicationStatus status);

//     // // Returns bool to confirm deletion occurred
//     // Task<bool> DeleteAsync(Guid applicantId, Guid jobId);
// }