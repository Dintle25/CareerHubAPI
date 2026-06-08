using API.Models;

namespace API.Data;

public static class JobStore
{
    public static readonly List<Job> Jobs = new()
    {
        new Job(
            Guid.NewGuid(),
            "Frontend Developer",
            "Build beautiful user interfaces for our platform",
            "Bitcube",
            "Cape Town",
            JobType.FullTime,
            DateTime.UtcNow.AddDays(30)
        ),

        new Job(
            Guid.NewGuid(),
            "Software Engineer",
            "An experienced developer to join the backend team",
            "Bitcube",
            "Bloemfontein",
            JobType.FullTime,
            DateTime.UtcNow.AddDays(30)
        ),

        new Job(
            Guid.NewGuid(),
            "Data Analyst",
            "Analyze business data and create reports",
            "Bitcube",
            "Bloemfontein",
            JobType.PartTime,
            DateTime.UtcNow.AddDays(30)
        )
    };
}