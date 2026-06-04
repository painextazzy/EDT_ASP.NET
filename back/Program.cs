using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using back.Data;
using back.Services;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Configuration CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Base de données
var host = Environment.GetEnvironmentVariable("DB_HOST");
var port = Environment.GetEnvironmentVariable("DB_PORT");
var database = Environment.GetEnvironmentVariable("DB_NAME");
var username = Environment.GetEnvironmentVariable("DB_USER");
var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

var connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ========== SERVICES EXISTANTS (vos collègues) ==========
builder.Services.AddScoped<InscriptionService>();

// ========== NOUVEAUX SERVICES (gestion des cours et affectations) ==========
builder.Services.AddScoped<CoursService>();
builder.Services.AddScoped<AffectationService>();
builder.Services.AddScoped<SalleService>();
//backup
builder.Services.AddScoped<IDatabaseBackupService, DatabaseBackupService>();

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

app.UseCors("AllowAll");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();