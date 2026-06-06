using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos;
using back.Models;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AffectationController : ControllerBase
{
    private readonly AppDbContext _context;

    public AffectationController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/affectation
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var enseignements = await _context.Enseignements
            .Include(e => e.Cours)
            .Include(e => e.Enseignant)
            .Include(e => e.Niveau)
            .Include(e => e.Parcours)
            .ToListAsync();

        var affectations = new List<AffectationDto>();

        foreach (var e in enseignements)
        {
            var dto = new AffectationDto
            {
                Id = e.Id,
                Code = e.Cours != null ? e.Cours.Code : "",
                Name = e.Cours != null ? e.Cours.Nom : "",
                Professor = e.Enseignant != null ? e.Enseignant.Nom : "",
                Mention = e.Parcours != null ? e.Parcours.Libelle : "",
                Niveau = e.Niveau != null ? e.Niveau.Libelle : ""
            };

            affectations.Add(dto);
        }

        return Ok(affectations);
    }

    // GET: api/affectation/mentions
    [HttpGet("mentions")]
    public async Task<IActionResult> GetMentions()
    {
        var mentions = await _context.Parcours
            .Select(p => new { id = p.Id, libelle = p.Libelle })
            .ToListAsync();
        return Ok(mentions);
    }

    // GET: api/affectation/niveaux
    [HttpGet("niveaux")]
    public async Task<IActionResult> GetNiveaux()
    {
        var niveaux = await _context.Niveaux
            .Select(n => new { id = n.Id, libelle = n.Libelle })
            .ToListAsync();
        return Ok(niveaux);
    }

    // GET: api/affectation/professeurs
    [HttpGet("professeurs")]
    public async Task<IActionResult> GetProfesseurs()
    {
        var professeurs = await _context.Enseignants
            .Select(e => new { e.Id, e.Nom })
            .ToListAsync();
        return Ok(professeurs);
    }

    // POST: api/affectation
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAffectationDto dto)
    {
        try
        {
            // Trouver ou créer le parcours
            var parcours = await _context.Parcours
                .FirstOrDefaultAsync(p => p.Libelle == dto.Mention);
            if (parcours == null)
            {
                parcours = new Parcours { Libelle = dto.Mention };
                _context.Parcours.Add(parcours);
                await _context.SaveChangesAsync();
            }

            // Trouver ou créer le niveau
            var niveau = await _context.Niveaux
                .FirstOrDefaultAsync(n => n.Libelle == dto.Niveau);
            if (niveau == null)
            {
                niveau = new Niveau { Libelle = dto.Niveau };
                _context.Niveaux.Add(niveau);
                await _context.SaveChangesAsync();
            }

            // Trouver ou créer le cours
            var cours = await _context.Matieres
                .FirstOrDefaultAsync(m => m.Code == dto.Code);
            if (cours == null)
            {
                cours = new Cours { Code = dto.Code, Nom = dto.Name };
                _context.Matieres.Add(cours);
                await _context.SaveChangesAsync();
            }

            // Trouver ou créer l'enseignant
            var enseignant = await _context.Enseignants
                .FirstOrDefaultAsync(e => e.Nom == dto.Professor);
            if (enseignant == null)
            {
                var randomIm = "IM-" + DateTime.Now.Ticks.ToString().Substring(0, 8);
                enseignant = new Enseignant
                {
                    Nom = dto.Professor,
                    Im = randomIm
                };
                _context.Enseignants.Add(enseignant);
                await _context.SaveChangesAsync();
            }

            // Vérifier si l'enseignement existe déjà
            var existingEnseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.IdMatiere == cours.Id &&
                                          e.IdEnseignant == enseignant.Id &&
                                          e.IdNiveau == niveau.Id &&
                                          e.IdParcours == parcours.Id);

            if (existingEnseignement != null)
            {
                return BadRequest(new { message = "Cette affectation existe déjà" });
            }

            // Créer l'enseignement
            var enseignement = new Enseignement
            {
                IdMatiere = cours.Id,
                IdEnseignant = enseignant.Id,
                IdNiveau = niveau.Id,
                IdParcours = parcours.Id,
                EstTermine = false
            };

            _context.Enseignements.Add(enseignement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Affectation créée avec succès", id = enseignement.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erreur lors de la création", error = ex.Message });
        }
    }

    // PUT: api/affectation/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAffectationDto dto)
    {
        try
        {
            var enseignement = await _context.Enseignements
                .Include(e => e.Cours)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignement == null)
                return NotFound(new { message = "Affectation non trouvée" });

            // Mettre à jour le nom du cours
            if (enseignement.Cours != null && !string.IsNullOrEmpty(dto.Name))
            {
                enseignement.Cours.Nom = dto.Name;
            }

            // Mettre à jour l'enseignant
            if (!string.IsNullOrEmpty(dto.Professor))
            {
                var enseignant = await _context.Enseignants
                    .FirstOrDefaultAsync(e => e.Nom == dto.Professor);
                if (enseignant != null)
                {
                    enseignement.IdEnseignant = enseignant.Id;
                }
                else
                {
                    var randomIm = "IM-" + DateTime.Now.Ticks.ToString().Substring(0, 8);
                    var newEnseignant = new Enseignant
                    {
                        Nom = dto.Professor,
                        Im = randomIm
                    };
                    _context.Enseignants.Add(newEnseignant);
                    await _context.SaveChangesAsync();
                    enseignement.IdEnseignant = newEnseignant.Id;
                }
            }

            // Mettre à jour le parcours
            if (!string.IsNullOrEmpty(dto.Mention))
            {
                var parcours = await _context.Parcours
                    .FirstOrDefaultAsync(p => p.Libelle == dto.Mention);
                if (parcours != null)
                {
                    enseignement.IdParcours = parcours.Id;
                }
                else
                {
                    var newParcours = new Parcours { Libelle = dto.Mention };
                    _context.Parcours.Add(newParcours);
                    await _context.SaveChangesAsync();
                    enseignement.IdParcours = newParcours.Id;
                }
            }

            // Mettre à jour le niveau
            if (!string.IsNullOrEmpty(dto.Niveau))
            {
                var niveau = await _context.Niveaux
                    .FirstOrDefaultAsync(n => n.Libelle == dto.Niveau);
                if (niveau != null)
                {
                    enseignement.IdNiveau = niveau.Id;
                }
                else
                {
                    var newNiveau = new Niveau { Libelle = dto.Niveau };
                    _context.Niveaux.Add(newNiveau);
                    await _context.SaveChangesAsync();
                    enseignement.IdNiveau = newNiveau.Id;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Affectation modifiée avec succès" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erreur lors de la modification", error = ex.Message });
        }
    }

    // DELETE: api/affectation/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var enseignement = await _context.Enseignements.FindAsync(id);
            if (enseignement == null)
                return NotFound(new { message = "Affectation non trouvée" });

            _context.Enseignements.Remove(enseignement);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Affectation supprimée avec succès" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Erreur lors de la suppression", error = ex.Message });
        }
    }
}