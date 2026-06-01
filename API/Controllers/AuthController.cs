// Used for JWT claims
using System.Security.Claims;

// Used for JWT token creation
using System.IdentityModel.Tokens.Jwt;

// Used for encoding the secret key
using System.Text;

// Authentication attributes
using Microsoft.AspNetCore.Authorization;

// MVC controller features
using Microsoft.AspNetCore.Mvc;

// JWT signing and validation classes
using Microsoft.IdentityModel.Tokens;

// Your DTOs namespace
using API.DTOs;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        
        if (request.Username != "employer" ||
            request.Password != "password123")
        {
            // Return 401 if credentials are incorrect
            return Unauthorized();
        }

       
        var claims = new[]
        {
            // Store the username in the token
            new Claim(JwtRegisteredClaimNames.Sub, request.Username),

            // Store the user's role
            new Claim(ClaimTypes.Role, "Employer")
        };

       
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes("super-secret-key-that-must-be-very-long-for-hs256-to-work-securely!")
        );

        // Create signing credentials using HmacSha256
        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

      
        var token = new JwtSecurityToken(
            claims: claims,

            // Token expires after 2 hours
            expires: DateTime.UtcNow.AddHours(2),

            // Sign the token
            signingCredentials: creds
        );

        // Convert the token to a string
        var tokenString = new JwtSecurityTokenHandler()
            .WriteToken(token);

        // Return the token to the client
        return Ok(new LoginResponse(tokenString));
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        // Read username from the JWT claims
        var username = User.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        // Read role from the JWT claims
        var role = User.FindFirstValue(
            ClaimTypes.Role);

        // Return current user information
        return Ok(new
        {
            Username = username,
            Role = role
        });
    }
}