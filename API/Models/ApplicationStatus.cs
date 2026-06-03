namespace API.Models;

// Represents the current state of a job application
public enum ApplicationStatus
{
    Submitted,
    UnderReview,
    InterviewScheduled,
    Accepted,
    Rejected
}