namespace API.Models;

public class Application
{
    // Composite key will be:
    // ApplicantId + JobId

    public Guid ApplicantId { get; set; }

    public Guid JobId { get; set; }

    // Date application was submitted
    public DateTime AppliedAt { get; set; }
        = DateTime.UtcNow;

    // Current application status
    public ApplicationStatus Status { get; set; }
        = ApplicationStatus.Submitted;

    // Required navigation to Applicant
    public Applicant Applicant { get; set; } = null!;

    // Required navigation to Job
    public Job Job { get; set; } = null!;
}