// namespace API.DTOs;

// // Represents the data sent by a user when logging in
// public record LoginRequest(
//     string Username,
//     string Password
// );

// Renamed to avoid conflict with Microsoft.AspNetCore.Identity.Data.LoginRequest
using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}