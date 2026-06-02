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


Log.Logger = new LoggerConfiguration()
.WriteTo.Console()
.CreateLogger();
try
{
    Log.Information("Starting up the Conference Booking API...");
// Phase 1: Builder-register the services into the app---dependency injection controller
var Builder = WebApplication.CreateBuilder(args);
Builder.Host.UseSerilog();


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
            // Allow requests from the Next.js frontend
            .WithOrigins("http://localhost:3000")

            // Allow all request headers
            .AllowAnyHeader()

            // Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
            .AllowAnyMethod();
    });
});


string jwtSecretKey = Builder.Configuration["Jwt:Key"]!;

// Configure JWT authentication
Builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            // Check if the token has expired
            ValidateLifetime = true,

            // Check if the signing key is valid
            ValidateIssuerSigningKey = true,

            // Issuer validation is not required for this assignment
            ValidateIssuer = false,

            // Audience validation is not required for this assignment
            ValidateAudience = false,

            // Create the security key from the appsettings value
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSecretKey))
        };
    });

// Register authorization services
Builder.Services.AddAuthorization();

// Register the authentication service
Builder.Services.AddScoped<IAuthService, AuthService>();

var app = Builder.Build();        //nothing can be registered after this


// Phase 2: Pipeline, configure your Middleware chain

if(app.Environment.IsDevelopment())
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
// Check if the user is authenticated
app.UseAuthentication();

// Check if the user is authorized
app.UseAuthorization();
app.MapControllers();
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