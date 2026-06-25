// Services/AuthService.cs
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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

            // ✅ 1. Vérifier l'email
            var user = await _context.Utilisateurs
                .Include(u => u.Enseignant)
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                _logger.LogWarning($"❌ Email non trouvé: {loginDto.Email}");
                throw new UnauthorizedAccessException("Email ou mot de passe incorrect");
            }

            // ✅ 2. Vérifier le mot de passe (BCrypt)
            if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                _logger.LogWarning($"❌ Mot de passe incorrect pour: {user.Email}");
                throw new UnauthorizedAccessException("Email ou mot de passe incorrect");
            }

            _logger.LogInformation($"✅ Connexion réussie pour: {user.Email}");

            // ✅ 3. Générer le token avec le rôle
            var token = GenerateJwtToken(user);

            // ✅ 4. Retourner la réponse avec le rôle
            return new LoginResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role ?? "ENSEIGNANT",  // 👈 Le rôle
                RedirectUrl = user.Role?.ToUpper() switch
                {
                    "ADMIN" => "/admin",
                    "ENSEIGNANT" => "/enseignant",
                    _ => "/login"
                },
                ExpiresAt = DateTime.UtcNow.AddMinutes(60),
                UserId = user.Id,
                EstValide = user.EstValide
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"❌ Erreur lors de la connexion pour: {loginDto.Email}");
            throw;
        }
    }

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
            new Claim(ClaimTypes.Role, user.Role ?? "ENSEIGNANT"),  // 👈 Rôle dans le token
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
}