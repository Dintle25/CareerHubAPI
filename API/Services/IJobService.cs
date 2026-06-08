using API.DTOs;
 
namespace API.Services;
 
public interface IJobService
{
    Task<IEnumerable<JobResponse>> GetActiveListingsAsync();
 
    Task<JobResponse?> GetByIdAsync(Guid jobId);
 
    Task<JobResponse> CreateAsync(CreateJobRequest request);
 
    Task<JobResponse> UpdateAsync(Guid jobId, UpdateJobRequest request);
 
    Task CloseAsync(Guid jobId);
}
 