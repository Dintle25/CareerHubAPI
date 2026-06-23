// namespace API.Models;

// public class Application
// {
//     // Composite key will be:
//     // ApplicantId + JobId
//      public Guid Id { get; set; } = Guid.NewGuid();
//     public Guid ApplicantId { get; set; }

//     public Guid JobId { get; set; }

//     // Date application was submitted
//     public DateTime AppliedAt { get; set; }
//         = DateTime.UtcNow;

//     // Current application status
//     public ApplicationStatus Status { get; set; }
//         = ApplicationStatus.Submitted;

//     // Required navigation to Applicant
//     public Applicant Applicant { get; set; } = null!;

//     // Required navigation to Job
//     public Job Job { get; set; } = null!;
// }

namespace API.Models;

public class Application
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Which job this application is for
    public Guid JobId { get; set; }

    // Applicant details collected from the form
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public int YearsOfExperience { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public string? LinkedInUrl { get; set; }
    public bool AvailableImmediately { get; set; }
    public int NoticePeriodWeeks { get; set; }

    // When the application was submitted
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

    // Current status in the hiring pipeline
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Submitted;

    // Navigation property to the job listing
    public Job Job { get; set; } = null!;
}