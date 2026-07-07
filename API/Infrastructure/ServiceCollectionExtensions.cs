// using API.Repositories;
// using API.Services;

// namespace API.Extensions;

// public static class ServiceCollectionExtensions
// {
//     public static IServiceCollection AddApplicationServices(
//         this IServiceCollection services)
//     {
//         services.AddScoped<ICompanyService, CompanyService>();

//         services.AddScoped<IApplicantService, ApplicantService>();

//         services.AddScoped<IApplicationService, ApplicationService>();

//         services.AddScoped<IAuthService, AuthService>();

//         services.AddScoped<IJobRepository, JobRepository>();

//         services.AddScoped<IApplicationRepository,
//             ApplicationRepository>();

//         return services;
//     }
// }


using API.Repositories;
using API.Services;

namespace API.Infrastructure;

/// <summary>
/// Keeps Program.cs clean by grouping DI registrations by feature area.
/// Add a new extension method here whenever you add a new feature area —
/// never call AddScoped/AddTransient/AddSingleton directly in Program.cs.
/// </summary>
public static class ServiceCollectionExtensions
{
    // ── Entry point called from Program.cs ──────────────────────────────────
    public static IServiceCollection AddCareerHubServices(
        this IServiceCollection services)
    {
        services
            .AddJobServices()
            .AddApplicationServices()
            .AddCompanyServices()
            .AddApplicantServices()
            .AddAuthServices();

        return services;
    }

    // ── Feature areas ────────────────────────────────────────────────────────

    private static IServiceCollection AddJobServices(
        this IServiceCollection services)
    {
        services.AddScoped<IJobService, JobService>();
        services.AddScoped<IJobRepository, JobRepository>();
        return services;
    }

    private static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        services.AddScoped<IApplicationService, ApplicationService>();
        services.AddScoped<IApplicationRepository, ApplicationRepository>();
        return services;
    }

    private static IServiceCollection AddCompanyServices(
        this IServiceCollection services)
    {
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<ICompanyRepository, CompanyRepository>();
        return services;
    }

    private static IServiceCollection AddApplicantServices(
        this IServiceCollection services)
    {
        services.AddScoped<IApplicantService, ApplicantService>();
        services.AddScoped<IApplicantRepository, ApplicantRepository>();
        return services;
    }

    private static IServiceCollection AddAuthServices(
        this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}