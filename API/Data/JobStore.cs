using API.Models;
namespace API.Data;
public static class JobStore
{
    public static readonly List<Job> jobs = new()
    {
        new Job(
            Guid.NewGuid(),
            "Frontend Developer",
            "Build beautiful user interfaces for our platform",
            "Bitcube",
            "Cape Town",
            "Full-time"
        ),

        new Job(
            Guid.NewGuid(),
            "Software Engineer",
            "An experienced developer to join the backend team",
            "Bitcube",
            "Bloemfontein",
            "Full-time"
        ),

        new Job(
            Guid.NewGuid(),
            "Data analyst",
            "Analyze business data and create reports",
            "Bitcube",
            "Bloemfontein",
            "Part-time"
        )
    };

}
