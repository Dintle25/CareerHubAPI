using API.DTOs;
using API.Models;

namespace API.Repositories;

public interface IJobRepository
{
    Task<PagedResponse<JobResponse>> GetActiveListingsPagedAsync(
        JobListingFilterQuery filter,
    int page,
    int pageSize);

    // Task<JobResponse> PatchAsync(
    // Guid id,
    // UpdateJobListingRequest request);

    Task<Job?> GetEntityByIdAsync(Guid id);

    Task<IEnumerable<JobResponse>> SearchAsync(string term);

    Task<IEnumerable<JobResponse>> GetActiveListingsAsync();

    Task<Job?> GetListingWithDetailsAsync(Guid jobId);

    Task<bool> IsListingOpenAsync(Guid jobId);

    Task AddListingAsync(Job job);

    Task UpdateListingAsync(Job job);

    Task CloseListingAsync(Guid jobId);

    Task<PagedResponse<JobResponse>> GetAllListingsPagedAsync(int page, int pageSize);


}