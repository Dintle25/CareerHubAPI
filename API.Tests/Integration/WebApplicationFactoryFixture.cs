using API.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace API.Tests.Integration;

// This class is the TEST SERVER — it boots a real version of our API
// but in a controlled environment, so we can make HTTP requests against it
// without running the actual server manually.
//
// WebApplicationFactory<Program> is the built-in ASP.NET Core test host.
// IAsyncLifetime means it has async setup (InitializeAsync) and 
// teardown (DisposeAsync) — xUnit calls these automatically before/after tests.
public class WebApplicationFactoryFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    // This spins up a real PostgreSQL 16 database inside a Docker container.
    // It uses a separate test database so we never touch the real one.
    // The container doesn't start here — just configured. It starts in InitializeAsync.
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16")
        .WithDatabase("careerhubintegration")
        .WithUsername("testuser")
        .WithPassword("testpass")
        .Build();

    // This method lets us customise how the API starts up during testing.
    // We use it to swap out the real database connection for the test container.
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Override the connection string from appsettings.json
        // so the API connects to our Docker test database instead of the real one.
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = _container.GetConnectionString(),
            });
        });

        builder.ConfigureTestServices(services =>
        {
            // The API registered its own DbContext pointing at the real database.
            // We find that registration and remove it.
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<CareerHubDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Now we register a NEW DbContext that points at our test container instead.
            // Every request the API makes to the database now goes to Docker, not production.
            services.AddDbContext<CareerHubDbContext>(options =>
                options.UseNpgsql(_container.GetConnectionString()));
        });
    }

    // xUnit calls this BEFORE any test runs.
    // We start the Docker container here, then run migrations so the
    // database schema (tables, constraints, indexes) exists and is ready.
    public async Task InitializeAsync()
    {
        // Boot the postgres:16 Docker container and wait until it's ready
        await _container.StartAsync();

        // Create a temporary scope to get the DbContext from the DI container
        // and run all EF Core migrations against the fresh test database.
        // This creates all tables exactly as they are in production.
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CareerHubDbContext>();
        await db.Database.MigrateAsync();
    }

    // xUnit calls this AFTER all tests in the class finish.
    // We shut down the API first, then destroy the Docker container.
    // This cleans up all resources so nothing is left running.
    public new async Task DisposeAsync()
    {
        await base.DisposeAsync();     // shut down the test API server
        await _container.DisposeAsync(); // stop and remove the Docker container
    }
}