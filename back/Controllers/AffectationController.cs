// back/Controllers/AffectationController.cs - Version corrigée

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
    private readonly ILogger<AffectationController> _logger;

    public AffectationController(AppDbContext context, ILogger<AffectationController> logger)
    {
        _context = context;
        _logger = logger;
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
                Niveau = e.Niveau != null ? e.Niveau.Libelle : "",
                CoursId = e.IdMatiere,
                ProfesseurId = e.IdEnseignant
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
            .Select(e => new { e.Id, e.Nom, e.Im })
            .ToListAsync();
        return Ok(professeurs);
    }

    // GET: api/affectation/exists
    [HttpGet("exists")]
    public async Task<IActionResult> CheckExists(
        [FromQuery] int coursId,
        [FromQuery] int professeurId,
        [FromQuery] string mention,
        [FromQuery] string niveau)
    {
        try
        {
            var parcours = await _context.Parcours
                .FirstOrDefaultAsync(p => p.Libelle == mention);

            var niveauEntity = await _context.Niveaux
                .FirstOrDefaultAsync(n => n.Libelle == niveau);

            if (parcours == null || niveauEntity == null)
            {
                return Ok(new { exists = false });
            }

            var exists = await _context.Enseignements
                .AnyAsync(e => e.IdMatiere == coursId &&
                              e.IdEnseignant == professeurId &&
                              e.IdParcours == parcours.Id &&
                              e.IdNiveau == niveauEntity.Id);

            return Ok(new { exists = exists });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
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

            // Trouver l'enseignant
            var enseignant = await _context.Enseignants
                .FirstOrDefaultAsync(e => e.Nom == dto.Professor);

            // Vérifier si la matière est déjà affectée
            var existingEnseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.IdMatiere == cours.Id &&
                                          e.IdNiveau == niveau.Id &&
                                          e.IdParcours == parcours.Id);

            if (existingEnseignement != null)
            {
                return BadRequest(new { message = "Ce cours est déjà affecté à ce niveau et parcours" });
            }

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
            _logger.LogError(ex, "Erreur lors de la création");
            return StatusCode(500, new { message = "Erreur lors de la création", error = ex.Message });
        }
    }

    // 🔴 PUT: api/affectation/{id} - Version corrigée
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAffectationDto dto)
    {
        try
        {
            _logger.LogInformation($"Mise à jour de l'affectation {id}");

            var enseignement = await _context.Enseignements
                .Include(e => e.Cours)
                .Include(e => e.Enseignant)
                .Include(e => e.Niveau)
                .Include(e => e.Parcours)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignement == null)
            {
                return NotFound(new { message = "Affectation non trouvée" });
            }

            // 🔴 1. Mettre à jour le nom du cours (sans changer le code)
            if (enseignement.Cours != null && !string.IsNullOrEmpty(dto.Name))
            {
                // Vérifier si un autre cours existe déjà avec ce nom
                var existingCours = await _context.Matieres
                    .FirstOrDefaultAsync(m => m.Nom == dto.Name && m.Id != enseignement.Cours.Id);

                if (existingCours != null)
                {
                    return BadRequest(new { message = $"Un cours avec le nom '{dto.Name}' existe déjà" });
                }

                enseignement.Cours.Nom = dto.Name;
                _context.Matieres.Update(enseignement.Cours);
            }

            // 🔴 2. Gérer le professeur
            if (!string.IsNullOrEmpty(dto.Professor))
            {
                var targetEnseignant = await _context.Enseignants
                    .FirstOrDefaultAsync(e => e.Nom == dto.Professor);

                if (targetEnseignant == null)
                {
                    // Créer un nouveau professeur
                    var randomIm = "IM-" + DateTime.Now.Ticks.ToString().Substring(0, 8);
                    targetEnseignant = new Enseignant
                    {
                        Nom = dto.Professor,
                        Im = randomIm
                    };
                    _context.Enseignants.Add(targetEnseignant);
                    await _context.SaveChangesAsync();
                }

                enseignement.IdEnseignant = targetEnseignant.Id;
            }

            // 🔴 3. Gérer le parcours (mention)
            if (!string.IsNullOrEmpty(dto.Mention))
            {
                var targetParcours = await _context.Parcours
                    .FirstOrDefaultAsync(p => p.Libelle == dto.Mention);

                if (targetParcours == null)
                {
                    targetParcours = new Parcours { Libelle = dto.Mention };
                    _context.Parcours.Add(targetParcours);
                    await _context.SaveChangesAsync();
                }

                enseignement.IdParcours = targetParcours.Id;
            }

            // 🔴 4. Gérer le niveau
            if (!string.IsNullOrEmpty(dto.Niveau))
            {
                var targetNiveau = await _context.Niveaux
                    .FirstOrDefaultAsync(n => n.Libelle == dto.Niveau);

                if (targetNiveau == null)
                {
                    targetNiveau = new Niveau { Libelle = dto.Niveau };
                    _context.Niveaux.Add(targetNiveau);
                    await _context.SaveChangesAsync();
                }

                enseignement.IdNiveau = targetNiveau.Id;
            }

            // 🔴 5. Vérifier les conflits (optionnel - peut être fait côté frontend)
            // Sauvegarder les changements
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Affectation {id} mise à jour avec succès");

            return Ok(new
            {
                success = true,
                message = "Affectation modifiée avec succès",
                data = new
                {
                    id = enseignement.Id,
                    name = enseignement.Cours?.Nom,
                    professor = enseignement.Enseignant?.Nom,
                    mention = enseignement.Parcours?.Libelle,
                    niveau = enseignement.Niveau?.Libelle
                }
            });
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Erreur de concurrence lors de la mise à jour");
            return StatusCode(409, new { message = "Conflit de modification, veuillez réessayer" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour de l'affectation");
            return StatusCode(500, new { message = "Erreur lors de la modification", error = ex.Message });
        }
    }

    // DELETE: api/affectation/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var enseignement = await _context.Enseignements
                .Include(e => e.Cours)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignement == null)
                return NotFound(new { message = "Affectation non trouvée" });

            // Optionnel : Supprimer aussi le cours s'il n'est utilisé nulle part ailleurs ?
            // Mais par sécurité, on ne supprime que l'enseignement

            _context.Enseignements.Remove(enseignement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Affectation supprimée avec succès" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression");
            return StatusCode(500, new { message = "Erreur lors de la suppression", error = ex.Message });
        }
    }
}