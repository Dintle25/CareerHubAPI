// using System.ComponentModel.DataAnnotations;

// namespace API.DTOs;

// public class CreateApplicationRequest
// {
//     [Required]
//     public Guid ApplicantId { get; set; }

//     [Required]
//     public Guid JobId { get; set; }
// }

using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateApplicationRequest
{
    [Required]
    public Guid JobId { get; set; }

    [Required]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Phone]
    public string? Phone { get; set; }

    [Range(0, 50)]
    public int YearsOfExperience { get; set; }

    [Required]
    [MinLength(50)]
    public string CoverLetter { get; set; } = string.Empty;

    [Url]
    public string? LinkedInUrl { get; set; }

    public bool AvailableImmediately { get; set; }

    [Range(0, int.MaxValue)]
    public int NoticePeriodWeeks { get; set; }
}