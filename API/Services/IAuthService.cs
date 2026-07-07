// using API.DTOs;

// namespace API.Services;

// public interface IAuthService
// {
//     // Validates credentials and returns a JWT token
//     LoginResponse? Login(LoginRequest request);
// }

using API.DTOs;

// Use fully qualified aliases to avoid conflict with
// Microsoft.AspNetCore.Identity.Data.RegisterRequest / LoginRequest
using AppRegisterRequest = API.DTOs.RegisterRequest;
using AppLoginRequest = API.DTOs.LoginRequest;

namespace API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(AppRegisterRequest request);
    Task<AuthResponse> LoginAsync(AppLoginRequest request);
}