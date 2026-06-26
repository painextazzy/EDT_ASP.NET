using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using back.Data;
using back.Services;
using back.Hubs;
using EFCore.BulkExtensions;
using back.Models;  // ✅ Ajouter ce using pour FileUploadOptions

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

// ========== 📸 CONFIGURATION UPLOAD PHOTOS ==========
// ✅ DOIT être AVANT builder.Build() et AVANT l'appel à app.Build()
builder.Services.Configure<FileUploadOptions>(
    builder.Configuration.GetSection("FileUpload")
);

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

// ✅ Construction de l'application (APRÈS toutes les configurations)
var app = builder.Build();

// ========== CRÉER LES DOSSIERS NÉCESSAIRES ==========
using (var scope = app.Services.CreateScope())
{
    var env = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

    // Dossier des avatars par défaut
    var defaultAvatarDir = Path.Combine(env.WebRootPath, "images", "avatars");
    if (!Directory.Exists(defaultAvatarDir))
    {
        Directory.CreateDirectory(defaultAvatarDir);
        Console.WriteLine($"✅ Dossier avatars créé: {defaultAvatarDir}");
    }

    // Dossier d'upload des photos
    var uploadDir = Path.Combine(env.WebRootPath, "images", "uploads", "avatars");
    if (!Directory.Exists(uploadDir))
    {
        Directory.CreateDirectory(uploadDir);
        Console.WriteLine($"✅ Dossier upload créé: {uploadDir}");
    }
}

// ========== STATIC FILES ==========
app.UseStaticFiles();

// ========== MIDDLEWARE PIPELINE ==========
app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
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
Console.WriteLine($"📁 Upload path: wwwroot/images/uploads/avatars");

app.Run();