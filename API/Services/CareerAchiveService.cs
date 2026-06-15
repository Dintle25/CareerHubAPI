using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services;

public class CareerArchiveService(
    IServiceScopeFactory scopeFactory,
    ILogger<CareerArchiveService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("Career archive service started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await RunAsync(stoppingToken);

            await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
        }
    }

    private async Task RunAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CareerHubDbContext>();

        var tomorrow = DateTime.UtcNow.Date.AddDays(1);
        var count = await db.Jobs
            .AsNoTracking()
            .CountAsync(b => b.PostedAt.Date == tomorrow, cancellationToken);

        logger.LogInformation(
            "Daily summary: {Count} application scheduled for tomorrow ({Date:yyyy-MM-dd}).",
            count,
            tomorrow);
    }
}
