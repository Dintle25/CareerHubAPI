using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface ICompanyRepository
{
    Task<IEnumerable<CompanyResponse>> GetAllAsync();

    Task<CompanyResponse?> GetByIdAsync(Guid id);

    Task<CompanyResponse> AddAsync(Company company);
}
