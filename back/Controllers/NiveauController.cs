// Controllers/NiveauController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;
using back.Dtos;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NiveauController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NiveauController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/niveau - Liste tous les niveaux
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var niveaux = await _context.Niveaux
                    .OrderBy(n => n.Id)
                    .Select(n => new NiveauDto
                    {
                        Id = n.Id,
                        Libelle = n.Libelle
                    })
                    .ToListAsync();

                return Ok(niveaux);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération", error = ex.Message });
            }
        }

        // GET: api/niveau/{id} - Détails d'un niveau
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var niveau = await _context.Niveaux
                    .Where(n => n.Id == id)
                    .Select(n => new NiveauDto
                    {
                        Id = n.Id,
                        Libelle = n.Libelle
                    })
                    .FirstOrDefaultAsync();

                if (niveau == null)
                    return NotFound(new { message = "Niveau non trouvé" });

                return Ok(niveau);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la récupération", error = ex.Message });
            }
        }

        // POST: api/niveau - Créer un niveau
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNiveauDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.Libelle))
                    return BadRequest(new { message = "Le libellé est requis" });

                // Vérifier si le niveau existe déjà (insensible à la casse)
                var existing = await _context.Niveaux
                    .FirstOrDefaultAsync(n => n.Libelle.ToLower() == dto.Libelle.ToLower());

                if (existing != null)
                    return BadRequest(new { message = "Ce niveau existe déjà" });

                var niveau = new Niveau
                {
                    Libelle = dto.Libelle
                };

                _context.Niveaux.Add(niveau);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Niveau créé avec succès", id = niveau.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la création", error = ex.Message });
            }
        }

        // PUT: api/niveau/{id} - Modifier un niveau
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateNiveauDto dto)
        {
            try
            {
                var niveau = await _context.Niveaux.FindAsync(id);
                if (niveau == null)
                    return NotFound(new { message = "Niveau non trouvé" });

                if (string.IsNullOrEmpty(dto.Libelle))
                    return BadRequest(new { message = "Le libellé est requis" });

                // Vérifier si un autre niveau a le même libellé (insensible à la casse)
                var existing = await _context.Niveaux
                    .FirstOrDefaultAsync(n => n.Libelle.ToLower() == dto.Libelle.ToLower() && n.Id != id);

                if (existing != null)
                    return BadRequest(new { message = "Ce niveau existe déjà" });

                niveau.Libelle = dto.Libelle;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Niveau modifié avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la modification", error = ex.Message });
            }
        }

        // DELETE: api/niveau/{id} - Supprimer un niveau
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var niveau = await _context.Niveaux.FindAsync(id);
                if (niveau == null)
                    return NotFound(new { message = "Niveau non trouvé" });

                // Vérifier si le niveau est utilisé dans des enseignements
                var hasEnseignements = await _context.Enseignements.AnyAsync(e => e.IdNiveau == id);
                if (hasEnseignements)
                {
                    return BadRequest(new { message = "Impossible de supprimer: ce niveau est utilisé dans des enseignements" });
                }

                _context.Niveaux.Remove(niveau);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Niveau supprimé avec succès" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erreur lors de la suppression", error = ex.Message });
            }
        }
    }
}