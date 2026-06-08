// using API.Data;
// using API.DTOs;
// using API.Models;
// using Microsoft.EntityFrameworkCore;

// namespace API.Services;

// public class CompanyService : ICompanyService
// {
//     private readonly CareerHubDbContext _context;

//     public CompanyService(CareerHubDbContext context)
//     {
//         _context = context;
//     }

//     public async Task<IEnumerable<CompanyResponse>> GetAllAsync()
//     {
//         return await _context.Companies
//             .AsNoTracking()
//             .Select(c => new CompanyResponse
//             {
//                 Id = c.Id,
//                 Name = c.Name,
//                 Description = c.Description
//             })
//             .ToListAsync();
//     }

//      public async Task<CompanyResponse?> GetByIdAsync(Guid id)
//     {
//         return await _context.Companies
//             .AsNoTracking()
//             .Where(c => c.Id == id)
//             .Select(c => new CompanyResponse
//             {
//                 Id = c.Id,
//                 Name = c.Name,
//                 Description = c.Description
//             })
//             .FirstOrDefaultAsync();
//     }

//     public async Task<CompanyResponse> CreateAsync(
//         CreateCompanyRequest request)
//     {
//         var company = new Company
//         {
//             Id = Guid.NewGuid(),
//             Name = request.Name,
//             Description = request.Description
//         };

//         _context.Companies.Add(company);

//         await _context.SaveChangesAsync();

//         return new CompanyResponse
//         {
//             Id = company.Id,
//             Name = company.Name,
//             Description = company.Description
//         };
//     }
// }

using API.DTOs;
using API.Models;
using API.Repositories;

namespace API.Services;

/// <summary>
/// Company service — no Microsoft.EntityFrameworkCore imports.
/// All data access is delegated to ICompanyRepository.
/// </summary>
public class CompanyService(ICompanyRepository companyRepository) : ICompanyService
{
    public async Task<IEnumerable<CompanyResponse>> GetAllAsync()
    {
        return await companyRepository.GetAllAsync();
    }

    public async Task<CompanyResponse?> GetByIdAsync(Guid id)
    {
        return await companyRepository.GetByIdAsync(id);
    }

    public async Task<CompanyResponse> CreateAsync(CreateCompanyRequest request)
    {
        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description
        };

        return await companyRepository.AddAsync(company);
    }
}
