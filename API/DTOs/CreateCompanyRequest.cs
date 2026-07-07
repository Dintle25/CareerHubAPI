using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class CreateCompanyRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;
}