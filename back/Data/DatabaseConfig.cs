using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using back.Models;
namespace back.Data;

public static class DatabaseConfig
{
    private static string GetConnectionString()
    {
        var host = Environment.GetEnvironmentVariable("DB_HOST");
        var port = Environment.GetEnvironmentVariable("DB_PORT");
        var database = Environment.GetEnvironmentVariable("DB_NAME");
        var username = Environment.GetEnvironmentVariable("DB_USER");
        var password = Environment.GetEnvironmentVariable("DB_PASSWORD");
        
        if (string.IsNullOrEmpty(host) || string.IsNullOrEmpty(port) || 
            string.IsNullOrEmpty(database) || string.IsNullOrEmpty(username) || 
            string.IsNullOrEmpty(password))
        {
            throw new Exception("❌ Variables DB manquantes dans .env");
        }
        
        return $"Host={host};Port={port};Database={database};Username={username};Password={password}";
    }
    
    public static IServiceCollection AddDatabase(this IServiceCollection services)
    {
        var connectionString = GetConnectionString();
        
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));
        
        return services;
    }
    
    public static async Task<bool> TestConnectionAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        try
        {
            return await dbContext.Database.CanConnectAsync();
        }
        catch
        {
            return false;
        }
    }
}