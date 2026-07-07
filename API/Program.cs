using API.Middleware;
using Scalar.AspNetCore;
using Serilog;
// Enables JWT Bearer authentication
using Microsoft.AspNetCore.Authentication.JwtBearer;

// Provides classes for validating JWT tokens
using Microsoft.IdentityModel.Tokens;
// Used to convert the secret key into bytes
using System.Text;
using API.Services;
using Microsoft.EntityFrameworkCore;
using API.Data;
using API.Infrastructure;
using Asp.Versioning;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using System.Security.Claims;
using API.Infrastructure.OpenApi;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;


Log.Logger = new LoggerConfiguration()
.WriteTo.Console()
.CreateLogger();
try
{
    Log.Information("Starting up the Career Hub API...");
    // Phase 1: Builder-register the services into the app---dependency injection controller
    var Builder = WebApplication.CreateBuilder(args);
    Builder.Host.UseSerilog();


    Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;

    //Registering the services
    Builder.Services.AddControllers()
    .AddJsonOptions(options =>
        {

            options.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
                
        });   //registering builder support

        

    Builder.Services.AddProblemDetails();     // Turns all errors into standard format

    Builder.Services.AddOpenApi();
    Builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
    Builder.Services.AddProblemDetails();     //registering built-in OpenAPI document

    // Add CORS services to the application
    Builder.Services.AddCors(options =>
    {
        // Create a named policy called "FrontEndPolicy"
        options.AddPolicy("FrontEndPolicy", policy =>
        {
            policy
                //.AllowAnyOrigin()
                // Allow requests from the Next.js frontend
                .WithOrigins("http://localhost:3000","http://localhost:5076")

                // Allow all request headers
                .AllowAnyHeader()

                // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
                .AllowAnyMethod()
                .AllowCredentials()
                .WithExposedHeaders("X-Total-Count");
        });
    });


    var jwtSecretKey = Builder.Configuration["Jwt:Key"]!;


    Builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                // ValidateLifetime = true,
                // ValidateIssuerSigningKey = true,
                // ValidateIssuer = false,
                // ValidateAudience = false,
                // IssuerSigningKey = new SymmetricSecurityKey(
                //     Encoding.UTF8.GetBytes(jwtSecretKey))

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(Builder.Configuration["Jwt:Key"]!)),

                ValidateIssuer = false,
                ValidateAudience = false,

                RoleClaimType = ClaimTypes.Role
            };

            // Show JWT validation errors in the terminal
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Console.WriteLine("JWT ERROR:");
                    Console.WriteLine(context.Exception.Message);
                    return Task.CompletedTask;
                }
            };
        });

    Builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
}).AddMvc();


Builder.Services.AddScoped<CareerHubDocumentTransformer>();
    Builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer<CareerHubDocumentTransformer>();
    });

    // Register authorization services
    Builder.Services.AddAuthorization();

    // Register the authentication service
    Builder.Services.AddCareerHubServices();

    //register rate limiting--------------------------------------------------------------------------------
    Builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    options.OnRejected = async (context, cancellationToken) =>
    {
        var retryAfter = context.Lease.TryGetMetadata(
            MetadataName.RetryAfter,
            out var retryAfterTime
        )
            ? retryAfterTime.TotalSeconds.ToString()
            : "60";

        context.HttpContext.Response.StatusCode = 429;
        context.HttpContext.Response.Headers["Retry-After"] = retryAfter;

        await context.HttpContext.Response.WriteAsync(
            $"Rate limit exceeded. Please retry after {retryAfter} seconds."
        );
    };

    // GLOBAL policy
    options.AddFixedWindowLimiter("global", opt =>
    {
        opt.PermitLimit = 200;
        opt.Window = TimeSpan.FromSeconds(60);
        opt.QueueLimit = 0;
    });

    // SEARCH policy (sliding window, 6 segments = 10 sec precision)
    options.AddSlidingWindowLimiter("search", opt =>
    {
        opt.PermitLimit = 30;
        opt.Window = TimeSpan.FromSeconds(60);
        opt.SegmentsPerWindow = 6;
        opt.QueueLimit = 0;
    });

    // APPLY policy (applications)
    options.AddFixedWindowLimiter("apply", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(60);
        opt.QueueLimit = 0;
    });

    // POST LISTING policy
    options.AddFixedWindowLimiter("post-listing", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(60);
        opt.QueueLimit = 0;
    });
});

    // Register the database context----------------------------------------------------------------
    Builder.Services.AddDbContext<CareerHubDbContext>(options =>
    {
        // Connect EF Core to PostgreSQL
        options.UseNpgsql(
            Builder.Configuration.GetConnectionString("DefaultConnection"))
                    .UseSnakeCaseNamingConvention();
    });

    Builder.Host.UseDefaultServiceProvider(options =>
    {
        options.ValidateScopes = true;
        options.ValidateOnBuild = true;
    });


     Builder.Services.AddHealthChecks()
        .AddDbContextCheck<CareerHubDbContext>(
            name: "database",
            failureStatus: Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy,
            tags: ["ready"]);

    Builder.Services.AddHostedService<CareerArchiveService>();

    Builder.Host.UseDefaultServiceProvider(options =>
    {
        options.ValidateScopes  = true;
        options.ValidateOnBuild = true;
    });



    var app = Builder.Build();        //nothing can be registered after this


    // Phase 2: Pipeline, configure your Middleware chain

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference();
    }

    //Error Handling
    app.UseSerilogRequestLogging();
    // Apply the CORS policy for frontend requests
    app.UseCors("FrontEndPolicy");
    // Handle exceptions globally
    app.UseExceptionHandler();     // Catches unexpected errors and shows them nicely
    app.UseStatusCodePages();      // Turns 404, 400 and other status codes into nice error messages
                                   // Redirect HTTP requests to HTTPS
    app.UseHttpsRedirection();

   // app.UseCors("CareerHubCors");

    app.UseRateLimiter();
    // Check if the user is authenticated
    app.UseAuthentication();

    // Check if the user is authorized
    app.UseAuthorization();
    app.MapControllers()
   .RequireRateLimiting("global");
    //app.MapControllers();

    app.MapHealthChecks("/health/live", new HealthCheckOptions
    {
        Predicate = _ => false
    });

    app.MapHealthChecks("/health/ready", new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("ready")
    });

    app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Application failed to start correctly.");
}

finally
{
    Log.CloseAndFlush(); //Ensure all buffered log entries are flushed before application exit. 
}

public partial class Program { }