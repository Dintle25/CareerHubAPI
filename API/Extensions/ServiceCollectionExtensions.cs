using API.Services;

namespace API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        services.AddScoped<ICompanyService, CompanyService>();

        services.AddScoped<IApplicantService, ApplicantService>();

        services.AddScoped<IApplicationService, ApplicationService>();

        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}