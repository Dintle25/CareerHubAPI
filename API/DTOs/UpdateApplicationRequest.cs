using API.Models;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpdateApplicationRequest
{
    //[Required]
    public ApplicationStatus Status { get; set; }
}