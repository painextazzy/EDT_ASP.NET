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
                ProfessorAvatar = e.Enseignant != null ? e.Enseignant.Im : "",
                Mention = e.Parcours != null ? e.Parcours.Libelle : "",
                Niveau = e.Niveau != null ? e.Niveau.Libelle : "",
                CoursId = e.IdMatiere,
                ProfesseurId = e.IdEnseignant
            };

            affectations.Add(dto);
        }

        return Ok(affectations);
    }

    [HttpGet("mentions")]
    public async Task<IActionResult> GetMentions()
    {
        var mentions = await _context.Parcours
            .Select(p => new { id = p.Id, libelle = p.Libelle })
            .ToListAsync();
        return Ok(mentions);
    }

    [HttpGet("niveaux")]
    public async Task<IActionResult> GetNiveaux()
    {
        var niveaux = await _context.Niveaux
            .Select(n => new { id = n.Id, libelle = n.Libelle })
            .ToListAsync();
        return Ok(niveaux);
    }

    [HttpGet("professeurs")]
    public async Task<IActionResult> GetProfesseurs()
    {
        var professeurs = await _context.Enseignants
            .Select(e => new { e.Id, e.Nom, e.Im })
            .ToListAsync();
        return Ok(professeurs);
    }

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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAffectationDto dto)
    {
        try
        {
            var parcours = await _context.Parcours
                .FirstOrDefaultAsync(p => p.Libelle == dto.Mention);
            if (parcours == null)
            {
                parcours = new Parcours { Libelle = dto.Mention };
                _context.Parcours.Add(parcours);
                await _context.SaveChangesAsync();
            }

            var niveau = await _context.Niveaux
                .FirstOrDefaultAsync(n => n.Libelle == dto.Niveau);
            if (niveau == null)
            {
                niveau = new Niveau { Libelle = dto.Niveau };
                _context.Niveaux.Add(niveau);
                await _context.SaveChangesAsync();
            }

            var cours = await _context.Matieres
                .FirstOrDefaultAsync(m => m.Code == dto.Code);
            if (cours == null)
            {
                cours = new Cours { Code = dto.Code, Nom = dto.Name };
                _context.Matieres.Add(cours);
                await _context.SaveChangesAsync();
            }

            var existingEnseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e =>
                    e.IdMatiere == cours.Id &&
                    e.IdNiveau == niveau.Id &&
                    e.IdParcours == parcours.Id
                );

            if (existingEnseignement != null)
            {
                var existingProf = await _context.Enseignants
                    .FirstOrDefaultAsync(e => e.Id == existingEnseignement.IdEnseignant);

                var professeurActuel = existingProf?.Nom ?? "un autre professeur";

                return Conflict(new
                {
                    message = $"Ce cours est deja affecte a {professeurActuel} dans {dto.Mention} - {dto.Niveau}"
                });
            }

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

            return Ok(new { message = "Affectation creee avec succes", id = enseignement.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la creation");
            return StatusCode(500, new { message = "Erreur lors de la creation", error = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAffectationDto dto)
    {
        try
        {
            if (dto == null)
            {
                return BadRequest(new { message = "Les donnees sont requises" });
            }

            _logger.LogInformation($"Mise a jour affectation {id}");

            var enseignement = await _context.Enseignements
                .Include(e => e.Cours)
                .Include(e => e.Enseignant)
                .Include(e => e.Niveau)
                .Include(e => e.Parcours)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignement == null)
            {
                return NotFound(new { message = "Affectation non trouvee" });
            }

            var currentCoursId = enseignement.IdMatiere;
            var currentProfesseurId = enseignement.IdEnseignant;

            // 1. Changer le cours
            if (dto.CoursId > 0 && dto.CoursId != currentCoursId)
            {
                var cours = await _context.Matieres.FindAsync(dto.CoursId);
                if (cours == null)
                {
                    return BadRequest(new { message = $"Le cours avec l'ID {dto.CoursId} n'existe pas" });
                }

                var existingEnseignement = await _context.Enseignements
                    .FirstOrDefaultAsync(e =>
                        e.IdMatiere == dto.CoursId &&
                        e.IdNiveau == enseignement.IdNiveau &&
                        e.IdParcours == enseignement.IdParcours &&
                        e.Id != enseignement.Id
                    );

                if (existingEnseignement != null)
                {
                    var currentMention = enseignement.Parcours?.Libelle ?? "";
                    var currentNiveau = enseignement.Niveau?.Libelle ?? "";

                    return Conflict(new
                    {
                        message = $"Ce cours est deja affecte dans {currentMention} - {currentNiveau}"
                    });
                }

                enseignement.IdMatiere = dto.CoursId;
            }

            // 2. Changer le professeur
            if (dto.ProfesseurId > 0 && dto.ProfesseurId != currentProfesseurId)
            {
                var professeur = await _context.Enseignants.FindAsync(dto.ProfesseurId);
                if (professeur == null)
                {
                    return BadRequest(new { message = $"Le professeur avec l'ID {dto.ProfesseurId} n'existe pas" });
                }
                enseignement.IdEnseignant = dto.ProfesseurId;
            }

            // 3. Changer la mention
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

            // 4. Changer le niveau
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

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Affectation modifiee avec succes"
            });
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Erreur de concurrence");
            return StatusCode(409, new { message = "Conflit de modification, veuillez reessayer" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise a jour");
            return StatusCode(500, new { message = "Erreur lors de la modification", error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var enseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.Id == id);

            if (enseignement == null)
                return NotFound(new { message = "Affectation non trouvee" });

            _context.Enseignements.Remove(enseignement);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Affectation supprimee avec succes" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression");
            return StatusCode(500, new { message = "Erreur lors de la suppression", error = ex.Message });
        }
    }
}