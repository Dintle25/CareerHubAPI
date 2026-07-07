using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface IApplicantRepository
{
    Task<IEnumerable<ApplicantResponse>> GetAllAsync();
    Task<Applicant?> GetByIdAsync(Guid id);
    Task<Applicant?> GetByEmailAsync(string email); // needed for login and duplicate check
    Task<bool> ExistsAsync(Guid id);
    Task<ApplicantResponse> AddAsync(Applicant applicant);
}


// using API.DTOs;
// using API.Models;

// namespace API.Repositories;

// public interface IApplicantRepository
// {
//     Task<IEnumerable<ApplicantResponse>> GetAllAsync();

//     Task<Applicant?> GetByIdAsync(Guid id);
//     Task<Applicant?> GetByEmailAsync(string email); // needed for login + duplicate check

//     Task<bool> ExistsAsync(Guid id);

//     Task<ApplicantResponse> AddAsync(Applicant applicant);
// }



