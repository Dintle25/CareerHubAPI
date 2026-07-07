using System.Security.Claims;
using API.DTOs;
using API.Services;
using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

// Aliases to avoid conflict with Microsoft.AspNetCore.Identity.Data types
using AppRegisterRequest = API.DTOs.RegisterRequest;
using AppLoginRequest = API.DTOs.LoginRequest;

namespace API.Controllers;

[ApiController]
[ApiVersion(1)]
[Route("api/v{version:apiVersion}/[controller]")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // POST api/v1/auth/register
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] AppRegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);
        return Ok(result);
    }

    // POST api/v1/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] AppLoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return Ok(result);
    }

    // GET api/v1/auth/me — returns identity of the currently logged-in applicant
    [HttpGet("me")]
    [Authorize]
    public IActionResult GetCurrentUser()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email);
        var firstName = User.FindFirstValue(ClaimTypes.GivenName);
        var role = User.FindFirstValue(ClaimTypes.Role);

        return Ok(new { id, email, firstName, role });
    }
}


// using System.IdentityModel.Tokens.Jwt;
// using System.Security.Claims;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using API.DTOs;
// using API.Services;
// using Asp.Versioning;

// namespace API.Controllers;


// [ApiController]
// [ApiVersion(1)]
// //[Route("api/[controller]")]
// [Route("api/v{version:apiVersion}/[controller]")]
// public class AuthController : ControllerBase
// {
//     private readonly IAuthService _authService;

//     // Inject the authentication service
//     public AuthController(IAuthService authService)
//     {
//         _authService = authService;
//     }

//     [HttpPost("login")]
//     [AllowAnonymous]
//     public IActionResult Login([FromBody] LoginRequest request)
//     {
//         // Ask the service to authenticate the user
//         var response = _authService.Login(request);

//         // Return 401 if credentials are invalid
//         if (response is null)
//         {
//             return Unauthorized();
//         }

//         // Return the JWT token
//         return Ok(response);
//     }

//     [Authorize]
//     [HttpGet("me")]
//     public IActionResult GetCurrentUser()
//     {
//         // Read username from JWT claims
//         var username = User.FindFirstValue(
//             JwtRegisteredClaimNames.Sub);

//         // Read role from JWT claims
//         var role = User.FindFirstValue(
//             ClaimTypes.Role);

//         // Return current user information
//         return Ok(new
//         {
//             Username = username,
//             Role = role
//         });
//     }
// }