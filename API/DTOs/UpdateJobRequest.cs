using System.ComponentModel.DataAnnotations;
using API.Models;
namespace API.DTOs;

public record UpdateJobRequest
{
    [Required]
    [MinLength(5)]
    [MaxLength(120)]
    public string Title { get; set; }

    [Required]
    public Guid CompanyId { get; set; }

    [Required]
    public string Location { get; set; } 

    [Required]
    [MinLength(20)]
    public string Description { get; set; } 

    [Required]
    [EnumDataType(typeof(JobType))]
    [RegularExpression("^(FullTime|PartTime|Contract|Internship)$")]
    public JobType Type { get; set; }

    [Required]
    public DateTime ClosingDate { get; set; }

    [Range(1, double.MaxValue)]
    public decimal? SalaryMin { get; set; }

    [Range(1, double.MaxValue)]
    public decimal? SalaryMax { get; set; }
}