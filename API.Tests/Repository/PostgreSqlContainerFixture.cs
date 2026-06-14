using Testcontainers.PostgreSql;

namespace API.Tests.Repository;

// This class is the DOCKER DATABASE FIXTURE for repository tests.
// It spins up a real PostgreSQL database in a Docker container
// so repository tests can run against a real database instead of a fake one.
//
// IAsyncLifetime tells xUnit this class has async setup and teardown.
// xUnit calls InitializeAsync before tests run and DisposeAsync after they finish.
public class PostgreSqlContainerFixture : IAsyncLifetime
{
    // Configures the Docker container but doesn't start it yet.
    // postgres:16 is the Docker image — the same version used in production.
    // We use a separate test database, username and password so we never
    // accidentally touch the real database.
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16")
        .WithDatabase("careertest")
        .WithUsername("testuser")
        .WithPassword("123test")
        .Build();

    // Exposes the connection string so test classes can connect to this database.
    // The connection string is generated automatically by Testcontainers
    // using whatever random port Docker assigned to the container.
    public string ConnectionString => _container.GetConnectionString();

    // xUnit calls this BEFORE any test runs.
    // This is where we actually boot the Docker container.
    // Testcontainers waits until PostgreSQL is ready to accept connections
    // before returning — so by the time tests run, the DB is guaranteed to be up.
    public async Task InitializeAsync()
        => await _container.StartAsync();

    // xUnit calls this AFTER all tests finish.
    // This stops and removes the Docker container so nothing is left running.
    // DisposeAsync on the container handles both stopping and deleting it.
    public async Task DisposeAsync()
        => await _container.DisposeAsync();
}