// // using API.Models;

// // namespace API.Services;

// // public static class ApplicationStatusRules
// // {
// //     public static bool CanTransition(ApplicationStatus current, ApplicationStatus next)
// //     {
// //         return current switch
// //         {
// //             ApplicationStatus.Submitted =>
// //                 next is ApplicationStatus.UnderReview or ApplicationStatus.Rejected,

// //             ApplicationStatus.UnderReview =>
// //                 next is ApplicationStatus.Accepted or ApplicationStatus.Rejected,

// //             ApplicationStatus.Accepted => false,
// //             ApplicationStatus.Rejected => false,

// //             _ => false
// //         };
// //     }
// // }

// using API.Models;

// namespace API.Services.Rules;

// /// <summary>
// /// Defines the permitted status transition workflow for job applications.
// /// This class is intentionally static and dependency-free so it can be
// /// unit-tested independently of the database or any service infrastructure.
// ///
// /// Valid workflow:
// ///   Submitted  → UnderReview | Rejected
// ///   UnderReview → InterviewScheduled | Accepted | Rejected
// ///   InterviewScheduled → Accepted | Rejected
// ///   Accepted   → (terminal — no further transitions)
// ///   Rejected   → (terminal — no further transitions)
// /// </summary>
// public static class ApplicationStatusRules
// {
//     public static bool CanTransition(ApplicationStatus current, ApplicationStatus next)
//     {
//         return current switch
//         {
//             ApplicationStatus.Submitted =>
//                 next is ApplicationStatus.UnderReview
//                      or ApplicationStatus.Rejected,

//             ApplicationStatus.UnderReview =>
//                 next is ApplicationStatus.InterviewScheduled
//                      or ApplicationStatus.Accepted
//                      or ApplicationStatus.Rejected,

//             ApplicationStatus.InterviewScheduled =>
//                 next is ApplicationStatus.Accepted
//                      or ApplicationStatus.Rejected,

//             // Terminal states — no transitions permitted.
//             ApplicationStatus.Accepted => false,
//             ApplicationStatus.Rejected => false,

//             _ => false
//         };
//     }
// }

using API.Models;

namespace API.Services;


/// Single source of truth for application status transition rules.
///
/// DESIGN DECISION — why a Dictionary of HashSets:
///
/// The rules are encoded as a lookup table: each status maps to the set
/// of statuses it is allowed to move into. CanTransition() is a single
/// dictionary lookup — no switch, no if/else chain.
///
/// Requirement 3 — adding a future transition requires changing ONE line:
///   e.g. to allow Offered → Accepted, add ApplicationStatus.Accepted
///   to the HashSet on the Offered key. That is the only change needed.
///   No method signatures change, no switch arms need updating, no other
///   file is touched.
///
/// Requirement 2 — no database query:
///   This class is a pure static dictionary. CanTransition() is O(1) and
///   has zero dependencies — it can be called from the service layer or
///   from a unit test with no setup at all.
///
/// Requirement 1 — rules defined in exactly one place:
///   _allowed is the only place in the codebase where transitions are
///   listed. ApplicationService calls CanTransition(); it does not
///   duplicate the rules.

public static class ApplicationStatusRules
{
   
    /// The complete transition table.
    /// To add a new valid transition, add the target status to the
    /// correct HashSet below. One line. Nothing else changes.
    /// </summary>
    private static readonly Dictionary<ApplicationStatus, HashSet<ApplicationStatus>> _allowed = new()
    {
        [ApplicationStatus.Submitted]   = [ApplicationStatus.UnderReview],
        [ApplicationStatus.UnderReview] = [ApplicationStatus.Shortlisted, ApplicationStatus.Rejected],
        [ApplicationStatus.Shortlisted] = [ApplicationStatus.Offered,     ApplicationStatus.Rejected],

        // Terminal states — no further transitions permitted
        [ApplicationStatus.Offered]     = [],
        [ApplicationStatus.Rejected]    = [],
    };

 
    /// Returns true when moving from <paramref name="current"/> to
    /// <paramref name="next"/> is permitted by the transition table.
    /// Pure function — no database, no side effects, fully unit-testable.
    /// </summary>
    public static bool CanTransition(ApplicationStatus current, ApplicationStatus next)
        => _allowed.TryGetValue(current, out var permitted) && permitted.Contains(next);

    /// Returns all statuses reachable from <paramref name="current"/>.
    /// Useful for generating API documentation or UI hints.
    /// </summary>
    public static IReadOnlySet<ApplicationStatus> ValidTransitionsFrom(ApplicationStatus current)
        => _allowed.TryGetValue(current, out var permitted)
            ? permitted
            : new HashSet<ApplicationStatus>();
}