namespace API.DTOs;
public record JobListingFilterQuery
{
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public Guid? CompanyId { get; set; }

    public string Sort { get; set; } = "postedAt";
    public string? Dir { get; set; }
}