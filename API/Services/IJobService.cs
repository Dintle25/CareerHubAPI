using API.DTOs;
 
namespace API.Services;
 
public interface IJobService
{
    Task<PagedResponse<JobResponse>> GetActiveListingsPagedAsync(
    JobListingFilterQuery filter,
    int page,
    int pageSize);

    Task<JobResponse> PatchAsync(
    Guid id,
    UpdateJobListingRequest request);
    Task<IEnumerable<JobResponse>> GetActiveListingsAsync();
 
    Task<JobResponse?> GetByIdAsync(Guid jobId);
 
    Task<JobResponse> CreateAsync(CreateJobRequest request);
 
    Task<JobResponse> UpdateAsync(Guid jobId, UpdateJobRequest request);
 
    Task CloseAsync(Guid jobId);
    Task<PagedResponse<JobResponse>> GetAllListingsPagedAsync(int page, int pageSize);
}
 