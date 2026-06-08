// namespace API.Models;

// public class Job
// {
//     public Guid Id { get; set; }

//     public string Title { get; set; } = string.Empty;
//     public string Description { get; set; } = string.Empty;
//     //public string Company { get; set; } = string.Empty;
//     // Foreign key to Company
//     public Guid CompanyId { get; set; }

//     // Navigation property
//     public Company Company { get; set; } = null!;
//     public string Location { get; set; } = string.Empty;
//     public JobType Type { get; set; }
//     public DateTime ClosingDate { get; set; }

//     public DateTime PostedAt { get; set; } = DateTime.UtcNow;
//     public bool IsActive { get; set; }
    

//     public Job(Guid id, string title, string description, Company company, string location, JobType type, DateTime ClosingDate)
//     {
//         Id = id;
//         Title = title;
//         Description = description;
//         Company = company;
//         Location = location;
//         Type = type;
//         ClosingDate = ClosingDate;

//         // Server automatically sets these(not from the client)
//         PostedAt = DateTime.UtcNow;
//         IsActive = true;
//     }
//     public Job()
//     {
//     }

//     // Applications received for this job
//     public ICollection<Application> Applications { get; set; }
//         = new List<Application>();
// }

namespace API.Models;

public class Job
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    public string Location { get; set; } = string.Empty;
    public JobType Type { get; set; }
    public DateTime ClosingDate { get; set; }
    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; }

    public ICollection<Application> Applications { get; set; }
        = new List<Application>();

    public Job() { }

    public Job(Guid id, string title, string description, Company company,
               string location, JobType type, DateTime closingDate)
    {
        Id          = id;
        Title       = title;
        Description = description;
        Company     = company;
        CompanyId   = company.Id;
        Location    = location;
        Type        = type;
        // Normalise to UTC — PostgreSQL rejects Kind=Unspecified
        ClosingDate = closingDate.Kind == DateTimeKind.Utc
            ? closingDate
            : DateTime.SpecifyKind(closingDate, DateTimeKind.Utc);
        PostedAt    = DateTime.UtcNow;
        IsActive    = true;
    }
}