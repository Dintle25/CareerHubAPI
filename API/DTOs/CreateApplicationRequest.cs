using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateApplicationRequest
{
    [Required]
    public Guid ApplicantId { get; set; }

    [Required]
    public Guid JobId { get; set; }
}