using API.Models;

namespace API.DTOs;

public record JobResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } 
    public string Description { get; set; }
    public string Company { get; set; }
    public string Location { get; set; } 
    public JobType Type { get; set; }
    public DateTime PostedAt { get; set; }
    public bool IsActive { get; set; }
    public string SalaryDisplay { get; set; } 
}