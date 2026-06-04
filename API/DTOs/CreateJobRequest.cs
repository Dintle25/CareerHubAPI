using System.ComponentModel.DataAnnotations;
using API.Models;

namespace API.DTOs;

public record CreateJobRequest
{
    [Required(ErrorMessage = "Title is required")]
    [MinLength(5, ErrorMessage = "Title must be at least 5 characters")]
    [MaxLength(120, ErrorMessage = "Title cannot exceed 120 characters")]
    public string Title { get; set; } 

    [Required(ErrorMessage = "Company is required")]
    // [MinLength(2, ErrorMessage = "Company must be at least 2 characters")]
    // [MaxLength(80, ErrorMessage = "Company cannot exceed 80 characters")]
    //public string Company { get; set; }
    public Guid CompanyId { get; set; }

    [Required(ErrorMessage = "Location is required")]
    public string Location { get; set; } 

    [Required(ErrorMessage = "Description is required")]
    [MinLength(20, ErrorMessage = "Description must be at least 20 characters")]
    public string Description { get; set; } 

    [Required(ErrorMessage = "Type is required")]
    
    // [RegularExpression("^(FullTime|PartTime|Contract|Internship)$", 
    //     ErrorMessage = "Type must be FullTime, PartTime, Contract, or Internship")]
    
    public JobType Type { get; set; }

    [Range(1, double.MaxValue, ErrorMessage = "SalaryMin must be greater than 0")]
    public decimal? SalaryMin { get; set; }

    [Range(1, double.MaxValue, ErrorMessage = "SalaryMax must be greater than 0")]
    public decimal? SalaryMax { get; set; }
}