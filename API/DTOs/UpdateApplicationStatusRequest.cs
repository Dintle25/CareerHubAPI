using API.Models;

namespace API.DTOs;

public record UpdateApplicationStatusRequest
{
    public ApplicationStatus Status { get; set; }
}