using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using API.DTOs;
using API.Services;
using Asp.Versioning;

namespace API.Controllers;


[ApiController]
[ApiVersion(1)]
//[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    // Inject the authentication service
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Ask the service to authenticate the user
        var response = _authService.Login(request);

        // Return 401 if credentials are invalid
        if (response is null)
        {
            return Unauthorized();
        }

        // Return the JWT token
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        // Read username from JWT claims
        var username = User.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        // Read role from JWT claims
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