namespace API.Models;

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int YearsOfExperience { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public string? LinkedInUrl { get; set; }
    public bool AvailableImmediately { get; set; }
    public int NoticePeriodWeeks { get; set; }
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

    // Navigation to Job only — Applicant FK removed
    public Job Job { get; set; } = null!;
}
// namespace API.Models;

// public class Application
// {
//     public Guid Id { get; set; } = Guid.NewGuid();

//     // Which job this application is for
//     public Guid JobId { get; set; }

//     // Applicant details collected from the form
//     public string FullName { get; set; } = string.Empty;
//     public string Email { get; set; } = string.Empty;
//     public string? Phone { get; set; }
//     public int YearsOfExperience { get; set; }
//     public string CoverLetter { get; set; } = string.Empty;
//     public string? LinkedInUrl { get; set; }
//     public bool AvailableImmediately { get; set; }
//     public int NoticePeriodWeeks { get; set; }

//     // When the application was submitted
//     public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

//     // Current status in the hiring pipeline
//     public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

//     // Navigation property to the job listing
//     public Job Job { get; set; } = null!;
// }