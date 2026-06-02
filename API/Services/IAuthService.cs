using API.DTOs;

namespace API.Services;

public interface IAuthService
{
    // Validates credentials and returns a JWT token
    LoginResponse? Login(LoginRequest request);
}