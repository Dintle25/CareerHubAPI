namespace API.DTOs;

// Represents the data sent by a user when logging in
public record LoginRequest(
    string Username,
    string Password
);