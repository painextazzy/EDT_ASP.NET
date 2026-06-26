using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using back.Data;
using back.Models;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    // ❌ [Authorize] - SUPPRIMÉ pour permettre l'accès sans authentification
    public class ProfileController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IOptions<FileUploadOptions> _uploadOptions;
        private readonly ILogger<ProfileController> _logger;

        // ✅ Chemins constants
        private const string DEFAULT_AVATAR_PATH = "/images/avatars/default-avatar.png";
        private const string UPLOAD_AVATAR_PATH = "/images/uploads/avatars/";

        public ProfileController(
            AppDbContext context,
            IWebHostEnvironment env,
            IOptions<FileUploadOptions> uploadOptions,
            ILogger<ProfileController> logger)
        {
            _context = context;
            _env = env;
            _uploadOptions = uploadOptions;
            _logger = logger;
        }

        // ============================================================
        // 🔧 MÉTHODE POUR EXTRAIRE L'ID UTILISATEUR
        // ============================================================
        private int? GetUserIdFromClaims()
        {
            try
            {
                if (User == null || User.Identity == null || !User.Identity.IsAuthenticated)
                {
                    _logger.LogWarning("⚠️ Utilisateur non authentifié");
                    return null;
                }

                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    userIdClaim = User.FindFirst("id")?.Value;
                }
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    userIdClaim = User.FindFirst("userId")?.Value;
                }
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    userIdClaim = User.FindFirst("sub")?.Value;
                }
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    userIdClaim = User.FindFirst("nameid")?.Value;
                }

                _logger.LogInformation($"🔑 User ID extrait: {userIdClaim}");

                if (string.IsNullOrEmpty(userIdClaim))
                {
                    return null;
                }

                if (int.TryParse(userIdClaim, out int userId))
                {
                    return userId;
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur extraction claims");
                return null;
            }
        }

        // ============================================================
        // 🔧 ENDPOINT DE DÉBOGAGE
        // ============================================================
        [HttpGet("debug-claims")]
        public IActionResult DebugClaims()
        {
            try
            {
                var isAuthenticated = User?.Identity?.IsAuthenticated ?? false;

                List<object> claimsList = new List<object>();
                if (User != null && User.Claims != null)
                {
                    claimsList = User.Claims.Select(c => new { c.Type, c.Value }).ToList<object>();
                }

                var userId = GetUserIdFromClaims();

                return Ok(new
                {
                    success = true,
                    isAuthenticated = isAuthenticated,
                    userName = User?.Identity?.Name ?? "Non authentifié",
                    userId = userId,
                    claims = claimsList,
                    message = "🔓 Mode débogage - Authentification désactivée"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        // ============================================================
        // 📥 RÉCUPÉRER LE PROFIL
        // ============================================================
        [HttpGet("me")]
        public async Task<IActionResult> GetProfile([FromQuery] int? userId = null)
        {
            try
            {
                _logger.LogInformation("📥 Récupération du profil...");

                int targetUserId;

                if (userId.HasValue)
                {
                    targetUserId = userId.Value;
                    _logger.LogInformation($"👤 ID fourni en paramètre: {targetUserId}");
                }
                else
                {
                    var idFromClaims = GetUserIdFromClaims();
                    if (!idFromClaims.HasValue)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Aucun ID fourni. Passez userId en paramètre."
                        });
                    }
                    targetUserId = idFromClaims.Value;
                }

                var user = await _context.Utilisateurs
                    .Include(u => u.Enseignant)
                    .FirstOrDefaultAsync(u => u.Id == targetUserId);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Utilisateur non trouvé" });
                }

                var photoUrl = user.Enseignant?.PhotoUrl;
                if (string.IsNullOrEmpty(photoUrl) || photoUrl == "default-avatar.png")
                {
                    photoUrl = _uploadOptions.Value.DefaultAvatarPath;
                }

                string nom = "Utilisateur";
                if (user.Enseignant != null && !string.IsNullOrEmpty(user.Enseignant.Nom))
                {
                    nom = user.Enseignant.Nom;
                }
                else
                {
                    nom = user.Email?.Split('@')[0] ?? "Utilisateur";
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        user.Id,
                        user.Email,
                        user.Role,
                        user.EstValide,
                        Nom = nom,
                        PhotoUrl = photoUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur récupération profil");
                return StatusCode(500, new { success = false, message = "Erreur serveur" });
            }
        }

        // ============================================================
        // ✏️ METTRE À JOUR LE PROFIL
        // ============================================================
        [HttpPut("update")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto, [FromQuery] int? userId = null)
        {
            try
            {
                _logger.LogInformation("📝 Mise à jour du profil...");

                int targetUserId;

                if (userId.HasValue)
                {
                    targetUserId = userId.Value;
                }
                else
                {
                    var idFromClaims = GetUserIdFromClaims();
                    if (!idFromClaims.HasValue)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Aucun ID fourni. Passez userId en paramètre."
                        });
                    }
                    targetUserId = idFromClaims.Value;
                }

                var user = await _context.Utilisateurs
                    .Include(u => u.Enseignant)
                    .FirstOrDefaultAsync(u => u.Id == targetUserId);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Utilisateur non trouvé" });
                }

                // ✅ Créer un profil enseignant si nécessaire
                if (user.Enseignant == null)
                {
                    _logger.LogWarning($"⚠️ Création profil enseignant pour l'utilisateur {user.Id}");

                    var enseignant = new Enseignant
                    {
                        IdUtilisateur = user.Id,
                        Nom = dto.Nom ?? user.Email?.Split('@')[0] ?? "Utilisateur",
                        Im = "IM" + DateTime.Now.Ticks.ToString().Substring(0, 6),
                        PhotoUrl = "default-avatar.png"
                    };

                    user.Enseignant = enseignant;
                    await _context.Enseignants.AddAsync(enseignant);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"✅ Profil enseignant créé");
                }

                // ✅ Mettre à jour l'email
                if (!string.IsNullOrEmpty(dto.Email))
                {
                    user.Email = dto.Email;
                }

                // ✅ Mettre à jour le nom
                if (user.Enseignant != null && !string.IsNullOrEmpty(dto.Nom))
                {
                    user.Enseignant.Nom = dto.Nom;
                }

                // ✅ Mettre à jour le mot de passe
                if (!string.IsNullOrEmpty(dto.NewPassword))
                {
                    if (string.IsNullOrEmpty(dto.CurrentPassword) ||
                        !BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                    {
                        return BadRequest(new { success = false, message = "Mot de passe actuel incorrect" });
                    }

                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                }

                await _context.SaveChangesAsync();

                var photoUrl = user.Enseignant?.PhotoUrl;
                if (string.IsNullOrEmpty(photoUrl) || photoUrl == "default-avatar.png")
                {
                    photoUrl = _uploadOptions.Value.DefaultAvatarPath;
                }

                return Ok(new
                {
                    success = true,
                    message = "Profil mis à jour avec succès",
                    data = new
                    {
                        user.Id,
                        user.Email,
                        user.Role,
                        Nom = user.Enseignant?.Nom ?? user.Email?.Split('@')[0],
                        PhotoUrl = photoUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur mise à jour profil");
                return StatusCode(500, new { success = false, message = "Erreur serveur" });
            }
        }

        // ============================================================
        // 📤 UPLOAD PHOTO
        // ============================================================
        [HttpPost("upload-photo")]
        public async Task<IActionResult> UploadPhoto(
            [FromForm] IFormFile file,
            [FromQuery] int? userId = null)
        {
            try
            {
                _logger.LogInformation("========================================");
                _logger.LogInformation("📤 UPLOAD PHOTO - DÉBUT");

                // ✅ Vérifier le fichier
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Aucun fichier fourni" });
                }

                _logger.LogInformation($"📎 Fichier: {file.FileName}");
                _logger.LogInformation($"📎 Taille: {file.Length} bytes");
                _logger.LogInformation($"📎 Type: {file.ContentType}");

                // ✅ Vérifier l'extension
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_uploadOptions.Value.AllowedExtensions.Contains(extension))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Format non supporté. Utilisez: {string.Join(", ", _uploadOptions.Value.AllowedExtensions)}"
                    });
                }

                // ✅ Vérifier la taille
                if (file.Length > _uploadOptions.Value.MaxSizeInBytes)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = $"Fichier trop volumineux (max {_uploadOptions.Value.MaxSizeInBytes / 1024 / 1024}MB)"
                    });
                }

                // ✅ Récupérer l'ID utilisateur
                int targetUserId;

                if (userId.HasValue)
                {
                    targetUserId = userId.Value;
                    _logger.LogInformation($"👤 ID fourni en paramètre: {targetUserId}");
                }
                else
                {
                    var idFromClaims = GetUserIdFromClaims();
                    if (!idFromClaims.HasValue)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Aucun ID fourni. Passez userId en paramètre."
                        });
                    }
                    targetUserId = idFromClaims.Value;
                    _logger.LogInformation($"👤 ID extrait du token: {targetUserId}");
                }

                // ✅ Récupérer l'utilisateur
                var user = await _context.Utilisateurs
                    .Include(u => u.Enseignant)
                    .FirstOrDefaultAsync(u => u.Id == targetUserId);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Utilisateur non trouvé" });
                }

                _logger.LogInformation($"✅ Utilisateur: {user.Email}");

                // ✅ Créer un profil enseignant si nécessaire
                if (user.Enseignant == null)
                {
                    _logger.LogWarning($"⚠️ Création profil enseignant");

                    var enseignant = new Enseignant
                    {
                        IdUtilisateur = user.Id,
                        Nom = user.Email?.Split('@')[0] ?? "Utilisateur",
                        Im = "IM" + DateTime.Now.Ticks.ToString().Substring(0, 6),
                        PhotoUrl = "default-avatar.png"
                    };

                    user.Enseignant = enseignant;
                    await _context.Enseignants.AddAsync(enseignant);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation($"✅ Profil enseignant créé");
                }

                // ✅ Supprimer l'ancienne photo
                if (!string.IsNullOrEmpty(user.Enseignant.PhotoUrl)
                    && user.Enseignant.PhotoUrl != "default-avatar.png"
                    && !user.Enseignant.PhotoUrl.Contains("default-avatar.png"))
                {
                    var oldFileName = Path.GetFileName(user.Enseignant.PhotoUrl);
                    var oldPath = Path.Combine(_env.WebRootPath, "images", "uploads", "avatars", oldFileName);

                    if (System.IO.File.Exists(oldPath))
                    {
                        System.IO.File.Delete(oldPath);
                        _logger.LogInformation($"🗑️ Ancienne photo supprimée");
                    }
                }

                // ✅ Générer un nom unique
                var fileName = $"{Guid.NewGuid()}{extension}";
                var uploadPath = Path.Combine(_env.WebRootPath, "images", "uploads", "avatars");

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                // ✅ Sauvegarder le fichier
                var filePath = Path.Combine(uploadPath, fileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                _logger.LogInformation($"📤 Photo sauvegardée");

                // ✅ Mettre à jour PhotoUrl
                var photoUrl = $"{UPLOAD_AVATAR_PATH}{fileName}";
                user.Enseignant.PhotoUrl = photoUrl;
                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ UPLOAD PHOTO - SUCCÈS");

                return Ok(new
                {
                    success = true,
                    message = "Photo mise à jour avec succès",
                    data = new
                    {
                        photoUrl = photoUrl
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur upload photo");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur serveur",
                    details = ex.Message
                });
            }
        }

        // ============================================================
        // 🗑️ SUPPRIMER LA PHOTO
        // ============================================================
        [HttpDelete("delete-photo")]
        public async Task<IActionResult> DeletePhoto([FromQuery] int? userId = null)
        {
            try
            {
                _logger.LogInformation("🗑️ Suppression de la photo...");

                int targetUserId;

                if (userId.HasValue)
                {
                    targetUserId = userId.Value;
                }
                else
                {
                    var idFromClaims = GetUserIdFromClaims();
                    if (!idFromClaims.HasValue)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Aucun ID fourni. Passez userId en paramètre."
                        });
                    }
                    targetUserId = idFromClaims.Value;
                }

                var user = await _context.Utilisateurs
                    .Include(u => u.Enseignant)
                    .FirstOrDefaultAsync(u => u.Id == targetUserId);

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Utilisateur non trouvé" });
                }

                if (user.Enseignant == null)
                {
                    return Ok(new { success = true, message = "Aucune photo à supprimer" });
                }

                if (!string.IsNullOrEmpty(user.Enseignant.PhotoUrl)
                    && user.Enseignant.PhotoUrl != "default-avatar.png"
                    && !user.Enseignant.PhotoUrl.Contains("default-avatar.png"))
                {
                    var oldFileName = Path.GetFileName(user.Enseignant.PhotoUrl);
                    var oldPath = Path.Combine(_env.WebRootPath, "images", "uploads", "avatars", oldFileName);

                    if (System.IO.File.Exists(oldPath))
                    {
                        System.IO.File.Delete(oldPath);
                        _logger.LogInformation($"🗑️ Photo supprimée");
                    }

                    user.Enseignant.PhotoUrl = "default-avatar.png";
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    success = true,
                    message = "Photo supprimée avec succès"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur suppression photo");
                return StatusCode(500, new { success = false, message = "Erreur serveur" });
            }
        }
    }

    // ============================================================
    // 📦 DTO
    // ============================================================
    public class UpdateProfileDto
    {
        public string? Email { get; set; }
        public string? Nom { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}