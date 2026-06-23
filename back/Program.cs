using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using back.Data;
using back.Services;
using back.Hubs;

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

// ========== BASE DE DONNÉES ==========
var host = Environment.GetEnvironmentVariable("DB_HOST");
var port = Environment.GetEnvironmentVariable("DB_PORT");
var database = Environment.GetEnvironmentVariable("DB_NAME");
var username = Environment.GetEnvironmentVariable("DB_USER");
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ========== SERVICES ==========
builder.Services.AddScoped<InscriptionService>();
builder.Services.AddScoped<CoursService>();
builder.Services.AddScoped<AffectationService>();
builder.Services.AddScoped<SalleService>();
builder.Services.AddScoped<DelegueService>();
builder.Services.AddScoped<IDatabaseBackupService, DatabaseBackupService>();
builder.Services.AddScoped<PlanningService>();

// ========== SIGNALR ==========
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
    options.MaximumReceiveMessageSize = 102400000;
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.MapHub<MainHub>("/mainHub");

// 🔒 Log minimal - sans informations sensibles
Console.WriteLine("✅ Application démarrée");
Console.WriteLine($"🔗 Frontend: {frontendUrl}");

app.Run();