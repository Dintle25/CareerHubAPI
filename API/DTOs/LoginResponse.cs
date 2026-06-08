namespace API.DTOs;

// Represents the data returned after a successful login
public record LoginResponse(
    string Token
);