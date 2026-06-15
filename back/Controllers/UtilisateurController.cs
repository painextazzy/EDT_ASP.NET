// Controllers/UtilisateurController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UtilisateurController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UtilisateurController(AppDbContext context)
        {
            _context = context;
        }

        // DELETE: api/utilisateur/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var utilisateur = await _context.Utilisateurs
                    .Include(u => u.Enseignant)
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (utilisateur == null)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }

                // Vérifier si l'enseignant a des enseignements
                if (utilisateur.Enseignant != null)
                {
                    bool hasEnseignements = await _context.Enseignements
                        .AnyAsync(e => e.IdEnseignant == utilisateur.Enseignant.Id);

                    if (hasEnseignements)
                    {
                        return BadRequest(new { message = "Impossible: l'enseignant a des cours associés" });
                    }
                }

                // Supprimer l'utilisateur (l'enseignant sera supprimé automatiquement par cascade)
                _context.Utilisateurs.Remove(utilisateur);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Utilisateur et enseignant supprimés avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}