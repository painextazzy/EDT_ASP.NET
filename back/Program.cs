using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using back.Data;
using back.Services;
using back.Hubs;
using EFCore.BulkExtensions;


// Charger les variables d'environnement
Env.Load();


var builder = WebApplication.CreateBuilder(args);

// ========== LECTURE DES CONFIGURATIONS ==========
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";

// ========== CONFIGURATION CORS ==========
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(frontendUrl)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ========== BASE DE DONNÉES (via DatabaseConfig) ==========
builder.Services.AddDatabase();


// ========== AUTHENTIFICATION JWT ==========
var keyString = Environment.GetEnvironmentVariable("JWT_KEY")
    ?? throw new Exception("❌ JWT_KEY non configurée dans .env");

var key = Encoding.UTF8.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
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
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "https://localhost:5181",
        ValidateAudience = true,
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "http://localhost:5173",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    // ✅ Logs pour déboguer
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var authorization = context.Request.Headers["Authorization"].ToString();
            if (!string.IsNullOrEmpty(authorization) && authorization.StartsWith("Bearer "))
            {
                context.Token = authorization.Substring("Bearer ".Length).Trim();
                Console.WriteLine($"✅ Token reçu: {context.Token.Substring(0, 30)}...");
            }
            return Task.CompletedTask;
        },
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"❌ Erreur authentification: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"⚠️ Challenge JWT: {context.Error}");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ========== SERVICES ==========
builder.Services.AddScoped<InscriptionService>();
builder.Services.AddScoped<CoursService>();
builder.Services.AddScoped<AffectationService>();
builder.Services.AddScoped<SalleService>();
builder.Services.AddScoped<DelegueService>();
builder.Services.AddScoped<IDatabaseBackupService, DatabaseBackupService>();
builder.Services.AddScoped<PlanningService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// ========== SIGNALR ==========
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 102400000;
});

// ========== CONTROLEURS ==========
builder.Services.AddControllers();

var app = builder.Build();

// ========== STATIC FILES ==========
app.UseStaticFiles();

// ========== MIDDLEWARE PIPELINE (ORDRE IMPORTANT !) ==========
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();

// ✅ ORDRE CORRECT : Authentication AVANT Authorization
app.UseAuthentication();  // 👈 DOIT être AVANT UseAuthorization
app.UseAuthorization();

app.MapControllers();
app.MapHub<MainHub>("/mainHub");

// ========== TEST CONNEXION DB ==========
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        try
        {
            var isConnected = await DatabaseConfig.TestConnectionAsync(scope.ServiceProvider);
            Console.WriteLine(isConnected ? "✅ Connexion DB : SUCCÈS" : "❌ Connexion DB : ÉCHEC");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur de connexion DB : {ex.Message}");
        }
    }
}

// ========== LOGS ==========
Console.WriteLine("✅ Application démarrée");
Console.WriteLine($"🔗 Frontend: {frontendUrl}");
Console.WriteLine($"🔑 JWT_KEY: {(keyString != null ? "✅ Configurée" : "❌ Non configurée")}");
Console.WriteLine($"🔐 Issuer: {Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "https://localhost:5181"}");
Console.WriteLine($"🔐 Audience: {Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "http://localhost:5173"}");

app.Run();