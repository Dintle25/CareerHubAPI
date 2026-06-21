using API.Models;

namespace API.Services;


public static class ApplicationStatusRules
{

    private static readonly Dictionary<ApplicationStatus, HashSet<ApplicationStatus>> _allowed = new()
    {
        [ApplicationStatus.Submitted]   = [ApplicationStatus.UnderReview],
        [ApplicationStatus.UnderReview] = [ApplicationStatus.Shortlisted, ApplicationStatus.Rejected],
        [ApplicationStatus.Shortlisted] = [ApplicationStatus.Offered,     ApplicationStatus.Rejected],

        // Terminal states — no further transitions permitted
        [ApplicationStatus.Offered]     = [],
        [ApplicationStatus.Rejected]    = [],
    };

    public static bool CanTransition(ApplicationStatus current, ApplicationStatus next)
        => _allowed.TryGetValue(current, out var permitted) && permitted.Contains(next);

    public static IReadOnlySet<ApplicationStatus> ValidTransitionsFrom(ApplicationStatus current)
        => _allowed.TryGetValue(current, out var permitted)
            ? permitted
            : new HashSet<ApplicationStatus>();
}