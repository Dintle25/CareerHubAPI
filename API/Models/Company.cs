namespace API.Models;

public class Company
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    // One company can have many jobs
    public ICollection<Job> Jobs { get; set; } = new List<Job>();

    internal string ToLower()
    {
        throw new NotImplementedException();
    }

    public static implicit operator Company(string v)
    {
        throw new NotImplementedException();
    }
}