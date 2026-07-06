using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;        // ✅ Ajout pour SignalR
using back.Data;
using back.Dtos;
using back.Models;
using back.Hubs;                           // ✅ Ajout pour MainHub

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize(Roles = "ADMIN")]  // À activer quand l'authentification sera prête
    public class ValidationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ValidationController> _logger;
        private readonly IHubContext<MainHub> _hubContext;  // ✅ Injection de SignalR

        public ValidationController(
            AppDbContext context,
            ILogger<ValidationController> logger,
            IHubContext<MainHub> hubContext)                 // ✅ Constructeur mis à jour
        {
            _context = context;
            _logger = logger;
            _hubContext = hubContext;
        }

        // ========== MÉTHODE POUR ENVOYER LE COMPTEUR ==========
        private async Task NotifyDemandesCountAsync()
        {
            try
            {
                var count = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .CountAsync(e => e.Utilisateur != null && !e.Utilisateur.EstValide);

                await _hubContext.Clients.All.SendAsync("DemandesCountUpdated", count);
                _logger.LogInformation($"📊 Nouveau compteur envoyé: {count}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur lors de l'envoi du compteur SignalR");
            }
        }

        // ========== LISTER LES ENSEIGNANTS À VALIDER ==========
        [HttpGet("enseignants-en-attente")]
        public async Task<IActionResult> GetEnseignantsEnAttente()
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var enseignants = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .Where(e => e.Utilisateur != null && !e.Utilisateur.EstValide)
                    .Select(e => new EnseignantAVerifierDto
                    {
                        Id = e.Id,
                        Nom = e.Nom,
                        Im = e.Im,
                        Email = e.Utilisateur != null ? e.Utilisateur.Email : string.Empty,
                        PhotoUrl = string.IsNullOrEmpty(e.PhotoUrl) || e.PhotoUrl.Contains("default")
                            ? $"{baseUrl}/images/avatars/default-avatar.png"
                            : $"{baseUrl}{e.PhotoUrl}"
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = enseignants,
                    count = enseignants.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des enseignants en attente");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue lors de la récupération des données"
                });
            }
        }

        // ========== VALIDER UN ENSEIGNANT ==========
        [HttpPut("valider/{id}")]
        public async Task<IActionResult> ValiderEnseignant(int id)
        {
            try
            {
                var enseignant = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (enseignant == null)
                {
                    _logger.LogWarning($"Enseignant non trouvé: {id}");
                    return NotFound(new { success = false, message = "Enseignant non trouvé" });
                }

                if (enseignant.Utilisateur == null)
                {
                    _logger.LogWarning($"Compte utilisateur non associé pour l'enseignant: {id}");
                    return BadRequest(new { success = false, message = "Compte utilisateur non associé" });
                }

                if (enseignant.Utilisateur.EstValide)
                {
                    return BadRequest(new { success = false, message = "Cet enseignant est déjà validé" });
                }

                // ✅ Validation de l'utilisateur
                enseignant.Utilisateur.EstValide = true;
                await _context.SaveChangesAsync();

                // ✅ Notification SignalR (mise à jour du compteur)
                await NotifyDemandesCountAsync();

                _logger.LogInformation($"Enseignant validé: {enseignant.Nom} (ID: {id})");

                return Ok(new
                {
                    success = true,
                    message = $"L'enseignant {enseignant.Nom} a été validé avec succès",
                    data = new
                    {
                        enseignant.Id,
                        enseignant.Nom,
                        enseignant.Im,
                        Email = enseignant.Utilisateur.Email,
                        EstValide = enseignant.Utilisateur.EstValide
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de la validation de l'enseignant {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue lors de la validation"
                });
            }
        }

        // ========== REFUSER UN ENSEIGNANT ==========
        [HttpDelete("refuser/{id}")]
        public async Task<IActionResult> RefuserEnseignant(int id)
        {
            try
            {
                var enseignant = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (enseignant == null)
                {
                    _logger.LogWarning($"Enseignant non trouvé: {id}");
                    return NotFound(new { success = false, message = "Enseignant non trouvé" });
                }

                if (enseignant.Utilisateur == null)
                {
                    _logger.LogWarning($"Compte utilisateur non associé pour l'enseignant: {id}");
                    return BadRequest(new { success = false, message = "Compte utilisateur non associé" });
                }

                var nom = enseignant.Nom;
                var email = enseignant.Utilisateur.Email;
                var utilisateurId = enseignant.Utilisateur.Id;

                // ✅ Supprimer l'enseignant
                _context.Enseignants.Remove(enseignant);

                // ✅ Supprimer l'utilisateur
                var utilisateur = await _context.Utilisateurs.FindAsync(utilisateurId);
                if (utilisateur != null)
                {
                    _context.Utilisateurs.Remove(utilisateur);
                }

                await _context.SaveChangesAsync();

                // ✅ Notification SignalR (mise à jour du compteur)
                await NotifyDemandesCountAsync();

                _logger.LogInformation($"Enseignant refusé: {nom} (ID: {id}, Email: {email})");

                return Ok(new
                {
                    success = true,
                    message = $"La demande de {nom} a été refusée et supprimée"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors du refus de l'enseignant {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue lors du refus"
                });
            }
        }

        // ========== OBTENIR UN ENSEIGNANT SPÉCIFIQUE ==========
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEnseignant(int id)
        {
            try
            {
                var baseUrl = $"{Request.Scheme}://{Request.Host}";

                var enseignant = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (enseignant == null)
                {
                    return NotFound(new { success = false, message = "Enseignant non trouvé" });
                }

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        enseignant.Id,
                        enseignant.Nom,
                        enseignant.Im,
                        PhotoUrl = string.IsNullOrEmpty(enseignant.PhotoUrl) || enseignant.PhotoUrl.Contains("default")
                            ? $"{baseUrl}/images/avatars/default-avatar.png"
                            : $"{baseUrl}{enseignant.PhotoUrl}",
                        Utilisateur = enseignant.Utilisateur != null ? new
                        {
                            enseignant.Utilisateur.Id,
                            enseignant.Utilisateur.Email,
                            enseignant.Utilisateur.EstValide,
                            enseignant.Utilisateur.Role,
                            enseignant.Utilisateur.CreatedAt
                        } : null
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de la récupération de l'enseignant {id}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue"
                });
            }
        }

        // ========== STATISTIQUES ==========
        [HttpGet("statistiques")]
        public async Task<IActionResult> GetStatistiques()
        {
            try
            {
                var totalEnseignants = await _context.Enseignants.CountAsync();
                var enseignantsValides = await _context.Utilisateurs
                    .Where(u => u.Role == "ENSEIGNANT" && u.EstValide)
                    .CountAsync();
                var enseignantsEnAttente = await _context.Utilisateurs
                    .Where(u => u.Role == "ENSEIGNANT" && !u.EstValide)
                    .CountAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        totalEnseignants,
                        enseignantsValides,
                        enseignantsEnAttente,
                        tauxValidation = totalEnseignants > 0
                            ? Math.Round((double)enseignantsValides / totalEnseignants * 100, 2)
                            : 0
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue"
                });
            }
        }

        // ========== VALIDATION EN MASSE ==========
        [HttpPut("valider-masse")]
        public async Task<IActionResult> ValiderEnseignants([FromBody] List<int> ids)
        {
            try
            {
                if (ids == null || !ids.Any())
                {
                    return BadRequest(new { success = false, message = "Aucun ID fourni" });
                }

                var enseignants = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .Where(e => ids.Contains(e.Id) && e.Utilisateur != null && !e.Utilisateur.EstValide)
                    .ToListAsync();

                if (!enseignants.Any())
                {
                    return BadRequest(new { success = false, message = "Aucun enseignant à valider" });
                }

                foreach (var enseignant in enseignants)
                {
                    if (enseignant.Utilisateur != null)
                    {
                        enseignant.Utilisateur.EstValide = true;
                    }
                }

                await _context.SaveChangesAsync();

                // ✅ Notification SignalR (mise à jour du compteur)
                await NotifyDemandesCountAsync();

                _logger.LogInformation($"Validation en masse: {enseignants.Count} enseignants validés");

                return Ok(new
                {
                    success = true,
                    message = $"{enseignants.Count} enseignant(s) validé(s) avec succès",
                    data = enseignants.Select(e => new
                    {
                        e.Id,
                        e.Nom,
                        e.Im,
                        Email = e.Utilisateur?.Email
                    })
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation en masse");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue"
                });
            }
        }
    }
}