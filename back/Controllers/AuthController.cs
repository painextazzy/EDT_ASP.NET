// Controllers/AuthController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using back.Models.DTOs;
using back.Services;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        // ========== LOGIN ==========
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new
                    {
                        success = false,
                        errors = ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage)
                    });
                }

                var result = await _authService.LoginAsync(loginDto);

                return Ok(new
                {
                    success = true,
                    data = result,
                    message = "Connexion réussie"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la connexion");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue lors de la connexion"
                });
            }
        }

        // ========== RÉCUPÉRER LE PROFIL UTILISATEUR ==========
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return Unauthorized(new { success = false, message = "Non authentifié" });
                }

                var userId = int.Parse(userIdClaim);
                var user = await _authService.GetUserByIdAsync(userId);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Utilisateur non trouvé" });
                }

                var response = new
                {
                    user.Id,
                    user.Email,
                    user.Role,
                    user.EstValide,
                    user.CreatedAt,
                    Enseignant = user.Enseignant != null ? new
                    {
                        user.Enseignant.Id,
                        user.Enseignant.Im,
                        user.Enseignant.Nom,
                        user.Enseignant.PhotoUrl
                    } : null
                };

                return Ok(new
                {
                    success = true,
                    data = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur récupération utilisateur");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur lors de la récupération des données"
                });
            }
        }

        // ========== VALIDER LE TOKEN ==========
        [HttpGet("validate-token")]
        public async Task<IActionResult> ValidateToken([FromQuery] string token)
        {
            try
            {
                var isValid = await _authService.ValidateTokenAsync(token);
                return Ok(new
                {
                    valid = isValid,
                    message = isValid ? "Token valide" : "Token invalide"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur validation token");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur lors de la validation"
                });
            }
        }

        // ========== DÉCONNEXION ==========
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            return Ok(new
            {
                success = true,
                message = "Déconnexion réussie"
            });
        }
    }
}