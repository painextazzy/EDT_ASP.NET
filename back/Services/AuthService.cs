// Services/AuthService.cs
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using back.Models;
using back.Models.DTOs;
using back.Data;

namespace back.Services;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto loginDto);
    Task<Utilisateur?> GetUserByIdAsync(int id);
    Task<bool> ValidateTokenAsync(string token);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext context,
        IConfiguration configuration,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto loginDto)
    {
        try
        {
            _logger.LogInformation($"🔐 Tentative de connexion pour: {loginDto.Email}");

            var user = await _context.Utilisateurs
                .Include(u => u.Enseignant)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                _logger.LogWarning($"❌ Utilisateur non trouvé: {loginDto.Email}");
                throw new UnauthorizedAccessException("Email ou mot de passe incorrect");
            }

            if (!user.EstValide)
            {
                _logger.LogWarning($"⚠️ Compte non validé: {user.Email}");
                throw new UnauthorizedAccessException("Compte non validé. Veuillez vérifier votre email.");
            }

            // ✅ Vérification BCrypt
            bool isValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);
            Console.WriteLine($"✅ BCrypt.Verify: {isValid}");

            if (!isValid)
            {
                _logger.LogWarning($"❌ Mot de passe incorrect pour: {user.Email}");
                throw new UnauthorizedAccessException("Email ou mot de passe incorrect");
            }

            _logger.LogInformation($"✅ Mot de passe correct pour: {user.Email}");

            // ✅ Générer le token
            var token = GenerateJwtToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role ?? "ENSEIGNANT",
                RedirectUrl = user.Role?.ToUpper() switch
                {
                    "ADMIN" => "/admin/dashboard",
                    "ENSEIGNANT" => "/enseignant/dashboard",
                    _ => "/dashboard"
                },
                ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                UserId = user.Id,
                EstValide = user.EstValide
            };

            if (user.Role == "ENSEIGNANT" && user.Enseignant != null)
            {
                response.Enseignant = new EnseignantInfoDto
                {
                    Id = user.Enseignant.Id,
                    Im = user.Enseignant.Im,
                    Nom = user.Enseignant.Nom,
                    PhotoUrl = user.Enseignant.PhotoUrl
                };
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"❌ Erreur lors de la connexion pour: {loginDto.Email}");
            throw;
        }
    }

    // ========== GÉNÉRER LE TOKEN ==========
    private string GenerateJwtToken(Utilisateur user)
    {
        var keyString = Environment.GetEnvironmentVariable("JWT_KEY")
            ?? _configuration["Jwt:Key"]
            ?? throw new Exception("JWT_KEY non configurée");

        var key = Encoding.UTF8.GetBytes(keyString);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role ?? "ENSEIGNANT"),
            new Claim("est_valide", user.EstValide.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256
        );

        var expires = DateTime.UtcNow.AddMinutes(60);

        var token = new JwtSecurityToken(
            issuer: Environment.GetEnvironmentVariable("JWT_ISSUER") ?? "https://localhost:5181",
            audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? "http://localhost:5173",
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<Utilisateur?> GetUserByIdAsync(int id)
    {
        return await _context.Utilisateurs
            .Include(u => u.Enseignant)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        if (string.IsNullOrEmpty(token))
            return false;

        try
        {
            var keyString = Environment.GetEnvironmentVariable("JWT_KEY")
                ?? _configuration["Jwt:Key"]
                ?? throw new Exception("JWT_KEY non configurée");

            var key = Encoding.UTF8.GetBytes(keyString);

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
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

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            if (principal == null)
                return false;

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return false;

            var user = await _context.Utilisateurs
                .FirstOrDefaultAsync(u => u.Id == int.Parse(userId) && u.EstValide);

            return user != null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Erreur validation token: {ex.Message}");
            return false;
        }
    }
}