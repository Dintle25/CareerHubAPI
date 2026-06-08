// namespace API.Models;

// // Represents the current state of a job application
// public enum ApplicationStatus
// {
//     Submitted,
//     UnderReview,
//     InterviewScheduled,
//     Accepted,
//     Rejected
// }

namespace API.Models;

/// <summary>
/// Represents every possible state a job application can be in.
/// The valid transitions between these states are defined exclusively
/// in ApplicationStatusRules — nowhere else.
/// </summary>
public enum ApplicationStatus
{
    Submitted,
    UnderReview,
    Shortlisted,
    Offered,
    Rejected
}