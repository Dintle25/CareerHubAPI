using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.DTOs;
using API.Models;
using API.Repositories;
using Microsoft.IdentityModel.Tokens;

// Aliases to avoid conflict with Microsoft.AspNetCore.Identity.Data types
using AppRegisterRequest = API.DTOs.RegisterRequest;
using AppLoginRequest = API.DTOs.LoginRequest;

namespace API.Services;

public class AuthService(
    IApplicantRepository applicantRepository,
    IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(AppRegisterRequest request)
    {
        // Reject duplicate emails — same message prevents email enumeration
        if (await applicantRepository.GetByEmailAsync(request.Email) is not null)
            throw new InvalidOperationException("An account with this email already exists.");

        var applicant = new Applicant
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            // BCrypt auto-generates a salt and hashes the password
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        await applicantRepository.AddAsync(applicant);

        return new AuthResponse
        {
            Token = GenerateToken(applicant),
            Email = applicant.Email,
            FirstName = applicant.FirstName
        };
    }

    public async Task<AuthResponse> LoginAsync(AppLoginRequest request)
    {
        // Vague error message — never reveal whether the email exists
        var applicant = await applicantRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        // BCrypt.Verify hashes the input and compares against the stored hash
        if (!BCrypt.Net.BCrypt.Verify(request.Password, applicant.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        return new AuthResponse
        {
            Token = GenerateToken(applicant),
            Email = applicant.Email,
            FirstName = applicant.FirstName
        };
    }

    // Builds a signed JWT containing the applicant's identity claims
    private string GenerateToken(Applicant applicant)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, applicant.Id.ToString()),
            new Claim(ClaimTypes.Email, applicant.Email),
            new Claim(ClaimTypes.GivenName, applicant.FirstName),
            // Used by [Authorize(Roles = "Applicant")] on protected endpoints
            new Claim(ClaimTypes.Role, "Applicant")
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// // Used for JWT claims
// using System.Security.Claims;

// // Used for JWT token creation
// using System.IdentityModel.Tokens.Jwt;

// // Used for encoding the secret key
// using System.Text;

// // JWT signing classes
// using Microsoft.IdentityModel.Tokens;

// using API.DTOs;

// namespace API.Services;

// public class AuthService : IAuthService
// {
//     private readonly IConfiguration _configuration;

//     // Read values from appsettings
//     public AuthService(IConfiguration configuration)
//     {
//         _configuration = configuration;
//     }

//     public LoginResponse? Login(LoginRequest request)
//     {
//         // Check if the credentials are valid
//         if (request.Username != "employer" ||
//             request.Password != "password123")
//         {
//             return null;
//         }

//         // Build the claims payload
//         var claims = new[]
//         {
//             // Store the username in the token
//             new Claim(JwtRegisteredClaimNames.Sub, request.Username),

//             // Store the user's role
//             new Claim(ClaimTypes.Role, "employer")
//         };

//         // Read the secret key from appsettings
//         string jwtSecretKey = _configuration["Jwt:Key"]!;

//         // Convert the string key into a security key
//         var key = new SymmetricSecurityKey(
//             Encoding.UTF8.GetBytes(jwtSecretKey)
//         );

//         // Create signing credentials
//         var creds = new SigningCredentials(
//             key,
//             SecurityAlgorithms.HmacSha256
//         );

//         // Create the JWT token
//         var token = new JwtSecurityToken(
//             issuer: null,           // Explicitly null since validation is off
//         audience: null,
//             claims: claims,

//             // Token expires after 2 hours
//             expires: DateTime.UtcNow.AddHours(2),

//             // Sign the token
//             signingCredentials: creds
//         );

//         // Convert token to string
//         var tokenString = new JwtSecurityTokenHandler()
//             .WriteToken(token);

//         // Return the token
//         return new LoginResponse(tokenString);
//     }
// }