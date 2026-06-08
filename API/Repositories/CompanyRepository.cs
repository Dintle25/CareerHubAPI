using API.Data;
using API.DTOs;
using API.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Repositories;

public class CompanyRepository(CareerHubDbContext context) : ICompanyRepository
{
    public async Task<IEnumerable<CompanyResponse>> GetAllAsync()
    {
        return await context.Companies
            .AsNoTracking()
            .Select(c => new CompanyResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .ToListAsync();
    }

    public async Task<CompanyResponse?> GetByIdAsync(Guid id)
    {
        return await context.Companies
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CompanyResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CompanyResponse> AddAsync(Company company)
    {
        context.Companies.Add(company);
        await context.SaveChangesAsync();

        return new CompanyResponse
        {
            Id = company.Id,
            Name = company.Name,
            Description = company.Description
        };
    }
}
