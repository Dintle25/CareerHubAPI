// namespace API.Models;

// public record Job
// (Guid Id,
//  string Title,
//  string Description,
//  string cLCompany,
//  string Location,
//  string Type,
//  DateTime PostedAt,
//  bool IsActive);

namespace API.Models;

public record Job
{
    public Guid Id { get; set; }
    public string Title { get; set; } 
    public string Description { get; set; } 
    public string Company { get; set; } 
    public string Location { get; set; }
    public JobType Type { get; set; }

    public DateTime PostedAt { get; set; }
    public bool IsActive { get; set; }

    // Constructor - Only 6 parameters
    public Job(Guid id, string title, string description, string company, string location, JobType type)
    {
        Id = id;
        Title = title;
        Description = description;
        Company = company;
        Location = location;
        Type = type;

        // Server automatically sets these(not from the client)
        PostedAt = DateTime.UtcNow;
        IsActive = true;
    }
}