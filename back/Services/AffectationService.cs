using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos;
using back.Models;

namespace back.Services;

public class AffectationService
{
    private readonly AppDbContext _context;

    public AffectationService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AffectationDto>> GetAllAffectations()
    {
        var affectations = await _context.Enseignements
            .Include(e => e.Cours)
            .Include(e => e.Enseignant)
            .Include(e => e.Niveau)
            .Include(e => e.Parcours)
            .ToListAsync();

        var result = new List<AffectationDto>();
        
        foreach (var e in affectations)
        {
            result.Add(new AffectationDto
            {
                Id = e.Id,
                Code = e.Cours != null ? e.Cours.Code : "",
                Name = e.Cours != null ? e.Cours.Nom : "",
                Professor = e.Enseignant != null ? e.Enseignant.Nom : "",
                ProfessorAvatar = e.Enseignant != null && !string.IsNullOrEmpty(e.Enseignant.PhotoUrl) 
                    ? e.Enseignant.PhotoUrl 
                    : $"https://ui-avatars.com/api/?background=0EA5E9&color=fff&name={Uri.EscapeDataString(e.Enseignant?.Nom ?? "User")}",
                Mention = e.Parcours != null ? e.Parcours.Libelle : "",
                Niveau = e.Niveau != null ? e.Niveau.Libelle : ""
            });
        }
        
        return result;
    }

    public async Task<List<string>> GetMentions()
    {
        return await _context.Parcours
            .Select(p => p.Libelle)
            .ToListAsync();
    }

    public async Task<List<string>> GetNiveaux()
    {
        return await _context.Niveaux
            .Select(n => n.Libelle)
            .ToListAsync();
    }

    public async Task<List<object>> GetProfesseurs()
    {
        var professeurs = await _context.Enseignants
            .Select(e => new { e.Id, e.Nom, e.PhotoUrl })
            .ToListAsync();
        
        return professeurs.Cast<object>().ToList();
    }

    public async Task<Enseignement?> CreateAffectation(CreateAffectationDto dto)
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

        // Trouver le niveau
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
            enseignant = new Enseignant 
            { 
                Nom = dto.Professor, 
                Im = "IM-" + DateTime.Now.Ticks.ToString().Substring(0, 8),
                PhotoUrl = $"https://ui-avatars.com/api/?background=0EA5E9&color=fff&name={Uri.EscapeDataString(dto.Professor)}"
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

        if (existingEnseignement != null) return null;

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
        return enseignement;
    }

    public async Task<Enseignement?> UpdateAffectation(int id, UpdateAffectationDto dto)
    {
        var enseignement = await _context.Enseignements
            .Include(e => e.Cours)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (enseignement == null) return null;

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
                var newEnseignant = new Enseignant 
                { 
                    Nom = dto.Professor, 
                    Im = "IM-" + DateTime.Now.Ticks.ToString().Substring(0, 8),
                    PhotoUrl = $"https://ui-avatars.com/api/?background=0EA5E9&color=fff&name={Uri.EscapeDataString(dto.Professor)}"
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
        return enseignement;
    }

    public async Task<bool> DeleteAffectation(int id)
    {
        var enseignement = await _context.Enseignements.FindAsync(id);
        if (enseignement == null) return false;

        _context.Enseignements.Remove(enseignement);
        await _context.SaveChangesAsync();
        return true;
    }
}