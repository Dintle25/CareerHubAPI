namespace API.Models;

public record Job
(Guid id, string title, string description, string company, string location, string type);