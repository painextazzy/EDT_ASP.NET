// Controllers/ParcoursController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;
using back.Dtos;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParcoursController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ParcoursController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/parcours - Liste toutes les mentions
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var parcours = await _context.Parcours
                    .OrderBy(p => p.Id)
                    .Select(p => new ParcoursDto
                    {
                        Id = p.Id,
                        Libelle = p.Libelle
                    })
                    .ToListAsync();

                return Ok(parcours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération", error = ex.Message });
            }
        }

        // GET: api/parcours/{id} - Détails d'une mention
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var parcours = await _context.Parcours
                    .Where(p => p.Id == id)
                    .Select(p => new ParcoursDto
                    {
                        Id = p.Id,
                        Libelle = p.Libelle
                    })
                    .FirstOrDefaultAsync();

                if (parcours == null)
                    return NotFound(new { message = "Mention non trouvée" });

                return Ok(parcours);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération", error = ex.Message });
            }
        }

        // POST: api/parcours - Créer une mention
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateParcoursDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Libelle))
                    return BadRequest(new { message = "Le libellé est requis" });

                // Vérifier si la mention existe déjà
                var existing = await _context.Parcours
                    .FirstOrDefaultAsync(p => p.Libelle == dto.Libelle);

                if (existing != null)
                    return BadRequest(new { message = "Cette mention existe déjà" });

                var parcours = new Parcours
                {
                    Libelle = dto.Libelle
                };

                _context.Parcours.Add(parcours);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Mention créée avec succès", id = parcours.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la création", error = ex.Message });
            }
        }

        // PUT: api/parcours/{id} - Modifier une mention
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateParcoursDto dto)
        {
            try
            {
                var parcours = await _context.Parcours.FindAsync(id);
                if (parcours == null)
                    return NotFound(new { message = "Mention non trouvée" });

                if (string.IsNullOrEmpty(dto.Libelle))
                    return BadRequest(new { message = "Le libellé est requis" });

                // Vérifier si une autre mention a le même libellé
                var existing = await _context.Parcours
                    .FirstOrDefaultAsync(p => p.Libelle == dto.Libelle && p.Id != id);

                if (existing != null)
                    return BadRequest(new { message = "Ce libellé est déjà utilisé" });

                parcours.Libelle = dto.Libelle;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Mention modifiée avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la modification", error = ex.Message });
            }
        }

        // DELETE: api/parcours/{id} - Supprimer une mention
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var parcours = await _context.Parcours.FindAsync(id);
                if (parcours == null)
                    return NotFound(new { message = "Mention non trouvée" });

                // Vérifier si la mention est utilisée dans des enseignements
                var hasEnseignements = await _context.Enseignements.AnyAsync(e => e.IdParcours == id);
                if (hasEnseignements)
                {
                    return BadRequest(new { message = "Impossible de supprimer: cette mention est utilisée dans des enseignements" });
                }

                _context.Parcours.Remove(parcours);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Mention supprimée avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la suppression", error = ex.Message });
            }
        }
    }
}