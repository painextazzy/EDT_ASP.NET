// Controllers/ValidationController.cs
//using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.DTos.Auth;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize(Roles = "ADMIN")]
    public class ValidationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ValidationController(AppDbContext context)
        {
            _context = context;
        }

        // ========== LISTER LES ENSEIGNANTS À VALIDER ==========
        [HttpGet("enseignants-en-attente")]
        public async Task<IActionResult> GetEnseignantsEnAttente()
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

            return Ok(enseignants);
        }

        // ========== VALIDER UN ENSEIGNANT ==========
        [HttpPut("valider/{id}")]
        public async Task<IActionResult> ValiderEnseignant(int id)
        {
            var enseignant = await _context.Enseignants
                .Include(e => e.Utilisateur)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignant == null)
                return NotFound(new { message = "Enseignant non trouvé" });

            if (enseignant.Utilisateur == null)
                return BadRequest(new { message = "Compte utilisateur non associé" });

            if (enseignant.Utilisateur.EstValide)
                return BadRequest(new { message = "Cet enseignant est déjà validé" });

            enseignant.Utilisateur.EstValide = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"L'enseignant {enseignant.Nom} a été validé avec succès" });
        }

        // ========== REFUSER UN ENSEIGNANT ==========
        [HttpDelete("refuser/{id}")]
        public async Task<IActionResult> RefuserEnseignant(int id)
        {
            var enseignant = await _context.Enseignants
                .Include(e => e.Utilisateur)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignant == null)
                return NotFound(new { message = "Enseignant non trouvé" });

            if (enseignant.Utilisateur == null)
                return BadRequest(new { message = "Compte utilisateur non associé" });

            var nom = enseignant.Nom;
            var utilisateurId = enseignant.Utilisateur.Id;

            _context.Enseignants.Remove(enseignant);

            var utilisateur = await _context.Utilisateurs.FindAsync(utilisateurId);
            if (utilisateur != null)
                _context.Utilisateurs.Remove(utilisateur);

            await _context.SaveChangesAsync();

            return Ok(new { message = $"La demande de {nom} a été refusée et supprimée" });
        }
    }
}