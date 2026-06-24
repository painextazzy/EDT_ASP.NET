// Config/JwtConfig.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace back.Config;

public static class JwtConfig
{
    // ✅ Méthodes pour lire les variables .env
    public static string GetJwtKey()
    {
        var key = Environment.GetEnvironmentVariable("JWT_KEY");
        if (string.IsNullOrEmpty(key))
            throw new Exception("❌ JWT_KEY manquante dans .env");
        return key;
    }

    public static string GetJwtIssuer()
        => Environment.GetEnvironmentVariable("JWT_ISSUER");

    public static string GetJwtAudience()
        => Environment.GetEnvironmentVariable("JWT_AUDIENCE");

    public static int GetJwtExpiryMinutes()
    {
        var value = Environment.GetEnvironmentVariable("JWT_EXPIRY_MINUTES");
        return int.TryParse(value, out int result) ? result : 60;
    }

    // ✅ Méthode d'extension pour Program.cs
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services)
    {
        var key = Encoding.UTF8.GetBytes(GetJwtKey());

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false;
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = GetJwtIssuer(),
                ValidateAudience = true,
                ValidAudience = GetJwtAudience(),
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var authorization = context.Request.Headers["Authorization"].ToString();
                    if (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer "))
                    {
                        context.Token = authorization.Substring("Bearer ".Length).Trim();
                    }
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }

    // ✅ Méthode de debug
    public static void PrintJwtConfiguration()
    {
        Console.WriteLine("=== JWT Configuration ===");
        Console.WriteLine($"JWT_KEY: {(GetJwtKey() != null ? "✅ Défini" : "❌ Non défini")}");
        Console.WriteLine($"JWT_ISSUER: {GetJwtIssuer()}");
        Console.WriteLine($"JWT_AUDIENCE: {GetJwtAudience()}");
        Console.WriteLine($"JWT_EXPIRY_MINUTES: {GetJwtExpiryMinutes()}");
        Console.WriteLine("=========================");
    }
}