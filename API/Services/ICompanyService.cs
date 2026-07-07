using API.DTOs;

namespace API.Services;

public interface ICompanyService
{
    Task<IEnumerable<CompanyResponse>> GetAllAsync();
    Task<CompanyResponse?> GetByIdAsync(Guid id);
    Task<CompanyResponse> CreateAsync(CreateCompanyRequest request);
}


