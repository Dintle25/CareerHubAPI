namespace API.DTOs;

// Returned by both /auth/register and /auth/login
public class AuthResponse
{
    // JWT token — the frontend stores this and sends it in Authorization: Bearer <token>
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
}