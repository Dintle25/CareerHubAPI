namespace API.DTOs;
public record UpdateJobListingRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public string? Location { get; init; }
    public string? EmploymentType { get; init; }
    public decimal? SalaryMin { get; init; }
    public decimal? SalaryMax { get; init; }
    public DateTime? ExpiresAt { get; init; }
}