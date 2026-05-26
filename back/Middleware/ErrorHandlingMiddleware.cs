using System.Net;
using System.Text.Json;

namespace GestionSalles.API.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur non gérée : {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";

        var (status, message) = ex switch
        {
            ArgumentException => (HttpStatusCode.BadRequest, ex.Message),
            KeyNotFoundException => (HttpStatusCode.NotFound, ex.Message),
            InvalidOperationException => (HttpStatusCode.Conflict, ex.Message),
            _ => (HttpStatusCode.InternalServerError,
                  "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter l'administrateur.")
        };

        context.Response.StatusCode = (int)status;

        var response = new
        {
            status = (int)status,
            message,
            timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}