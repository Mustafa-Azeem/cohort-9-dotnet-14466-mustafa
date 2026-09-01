using System;
using System.Net;
using System.Text.Json;
using TaskManagementTool.Application.Exceptions;

namespace TaskManagementTool.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        ArgumentNullException.ThrowIfNull(next);
        ArgumentNullException.ThrowIfNull(logger);

        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ApiException ex)
        {
            
            _logger.LogWarning(ex, "Handled API exception: {Message}", ex.Message);
            await WriteError(context, ex.StatusCode, ex.Message);
        }
        catch (Exception ex)
        {
           
            _logger.LogError(ex, "Unhandled exception on {Path}", context.Request.Path);
            await WriteError(context, (int)HttpStatusCode.InternalServerError, "Something went wrong. Please try again later.");
        }
    }

    private static async Task WriteError(HttpContext context, int statusCode, string message)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var payload = JsonSerializer.Serialize(new { error = message });
        await context.Response.WriteAsync(payload);
    }
}