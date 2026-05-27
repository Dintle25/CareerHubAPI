using Scalar.AspNetCore;

// Phase 1: Builder-register the services into the app---dependency injection controller
var Builder = WebApplication.CreateBuilder(args);

//Registering the services
Builder.Services.AddControllers();   //registering builder support

Builder.Services.AddOpenApi();     //registering built-in OpenAPI document

var app = Builder.Build();        //nothing can be registered after this


// Phase 2: Pipeline, configure your Middleware chain

if(app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapControllers();
app.Run();