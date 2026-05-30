using API.Middleware;
using Scalar.AspNetCore;
using Serilog;

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

var app = Builder.Build();        //nothing can be registered after this


// Phase 2: Pipeline, configure your Middleware chain

if(app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

//Error Handling
app.UseExceptionHandler();     // Catches unexpected errors and shows them nicely
app.UseStatusCodePages();      // Turns 404, 400 and other status codes into nice error messages

app.UseHttpsRedirection();

app.UseSerilogRequestLogging();
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