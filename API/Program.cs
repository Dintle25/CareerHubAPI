using Scalar.AspNetCore;

// Phase 1: Builder-register the services into the app---dependency injection controller
var Builder = WebApplication.CreateBuilder(args);

//Registering the services
Builder.Services.AddControllers()
.AddJsonOptions(options =>
    {
      
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });   //registering builder support

Builder.Services.AddProblemDetails();     // Turns all errors into standard format

Builder.Services.AddOpenApi();     //registering built-in OpenAPI document

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

app.MapControllers();
app.Run();