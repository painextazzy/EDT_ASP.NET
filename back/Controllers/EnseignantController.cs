// Controllers/EnseignantController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnseignantController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EnseignantController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/enseignant/valides
        [HttpGet("valides")]
        public async Task<IActionResult> GetEnseignantsValides()
        {
            try
            {
                var enseignantsValides = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .Where(e => e.Utilisateur != null && e.Utilisateur.EstValide == true)
                    .Select(e => new
                    {
                        e.Id,
                        e.Nom,
                        e.Im,
                        e.PhotoUrl,
                        Email = e.Utilisateur != null ? e.Utilisateur.Email : "",
                        EstValide = true
                    })
                    .OrderBy(e => e.Nom)
                    .ToListAsync();

                return Ok(enseignantsValides);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // DELETE: api/enseignant/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Récupérer l'enseignant
                var enseignant = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .FirstOrDefaultAsync(e => e.Id == id);

                if (enseignant == null)
                {
                    return NotFound(new { message = "Enseignant non trouvé" });
                }

                // Vérifier les enseignements associés
                bool hasEnseignements = await _context.Enseignements.AnyAsync(e => e.IdEnseignant == id);
                if (hasEnseignements)
                {
                    return BadRequest(new { message = "Impossible: cet enseignant a des enseignements" });
                }

                // Supprimer l'utilisateur (l'enseignant sera supprimé par cascade)
                if (enseignant.Utilisateur != null)
                {
                    _context.Utilisateurs.Remove(enseignant.Utilisateur);
                }
                else
                {
                    _context.Enseignants.Remove(enseignant);
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Enseignant supprimé avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}