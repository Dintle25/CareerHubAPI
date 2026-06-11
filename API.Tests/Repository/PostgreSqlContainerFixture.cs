using Testcontainers.PostgreSql;

namespace API.Tests.Repository;

public class PostgreSqlContainerFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:16")
        .WithDatabase("careertest")
        .WithUsername("testuser")
        .WithPassword("123test")
        .Build();

    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
        => await _container.StartAsync();

    public async Task DisposeAsync()
        => await _container.DisposeAsync();
}