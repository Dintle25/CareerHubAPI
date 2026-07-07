using API.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace API.Middleware; 
//IExceptionHandler is the interface for typed exception handling 
//AddEceptionHandler<T>() registers it; UseExceptionHandler() activates it. 
public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger): IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken
    )
    {
        logger.LogError(exception, "An expection occured: {Message}",exception.Message); 

       var statusCode = exception switch
       {
           JobNotFoundException => StatusCodes.Status404NotFound,
           DuplicateJobListingException => StatusCodes.Status409Conflict,
           _ => StatusCodes.Status500InternalServerError       
       }; 
       var problemDetails = new ProblemDetails
       {
           Status = statusCode,
           Title = GetTitle(statusCode),
           Detail = exception.Message,
           Instance = httpContext.Request.Path
       };
     
      httpContext.Response.StatusCode = statusCode;
      httpContext.Response.ContentType = "application/problem+json";
      await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken); 

      return true; 



    }
    private static string GetTitle(int statusCode) => statusCode switch
    {
        StatusCodes.Status404NotFound => "Resource Not Found",
        StatusCodes.Status409Conflict => "Resource Conflict", 
        _                             => "Internal server error"
    };

}