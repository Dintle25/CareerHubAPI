using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface IJobRepository
{
    Task<IEnumerable<JobResponse>> GetActiveListingsAsync();

    Task<Job?> GetListingWithDetailsAsync(Guid jobId);

    Task<bool> IsListingOpenAsync(Guid jobId);

    Task AddListingAsync(Job job);

    Task UpdateListingAsync(Job job);

    Task CloseListingAsync(Guid jobId);
    
}