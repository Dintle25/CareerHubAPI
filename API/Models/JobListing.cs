namespace API.Models;

public class Job
{
    public Guid Id { get; set; } 
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public JobType Type { get; set; } 

    public DateTime PostedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; }

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
    public Job()
{
}
}