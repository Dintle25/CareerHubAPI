namespace API.Models;

public class Applicant
{
    public Guid Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
     // Stores the bcrypt hash — never the plain text password
    public string PasswordHash { get; set; } = string.Empty;

    // One applicant can have many applications
    public ICollection<Application> Applications { get; set; }
        = new List<Application>();
}