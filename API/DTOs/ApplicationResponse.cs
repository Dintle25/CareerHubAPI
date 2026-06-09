using API.Models;

namespace API.DTOs;

public class ApplicationResponse
{
    public Guid Id { get; set; }
    public Guid ApplicantId { get; set; }

    public Guid JobId { get; set; }

    public DateTime AppliedAt { get; set; }

    public ApplicationStatus Status { get; set; }

    public string ApplicantName { get; set; } = string.Empty;

    public string JobTitle { get; set; } = string.Empty;
}