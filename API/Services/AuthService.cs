// Used for JWT claims
using System.Security.Claims;

// Used for JWT token creation
using System.IdentityModel.Tokens.Jwt;

// Used for encoding the secret key
using System.Text;

// JWT signing classes
using Microsoft.IdentityModel.Tokens;

using API.DTOs;

namespace API.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    // Read values from appsettings
    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public LoginResponse? Login(LoginRequest request)
    {
        // Check if the credentials are valid
        if (request.Username != "employer" ||
            request.Password != "password123")
        {
            return null;
        }

        // Build the claims payload
        var claims = new[]
        {
            // Store the username in the token
            new Claim(JwtRegisteredClaimNames.Sub, request.Username),

            // Store the user's role
            new Claim(ClaimTypes.Role, "Employer")
        };

        // Read the secret key from appsettings
        string jwtSecretKey = _configuration["Jwt:Key"]!;

        // Convert the string key into a security key
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSecretKey)
        );

        // Create signing credentials
        var creds = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        // Create the JWT token
        var token = new JwtSecurityToken(
            claims: claims,

            // Token expires after 2 hours
            expires: DateTime.UtcNow.AddHours(2),

            // Sign the token
            signingCredentials: creds
        );

        // Convert token to string
        var tokenString = new JwtSecurityTokenHandler()
            .WriteToken(token);

        // Return the token
        return new LoginResponse(tokenString);
    }
}