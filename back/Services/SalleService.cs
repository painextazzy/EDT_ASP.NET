using back.Data;
using back.DTos;
using back.Models;
using Microsoft.EntityFrameworkCore;

namespace back.Services;

public class SalleService
{
    private readonly AppDbContext _context;

    public SalleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SalleDto>> GetAllSalles(string? batiment, int? etage, string? search)
    {
        var query = _context.Salles.AsQueryable();

        // Logique de filtrage
        if (!string.IsNullOrWhiteSpace(batiment)) query = query.Where(s => s.Batiment == batiment);
        if (etage.HasValue) query = query.Where(s => s.Etage == etage.Value);

        if (!string.IsNullOrWhiteSpace(search)) {
            var sLower = search.ToLower();
            query = query.Where(x => 
                (x.NomSalle != null && x.NomSalle.ToLower().Contains(sLower)) || 
                (x.Batiment != null && x.Batiment.ToLower().Contains(sLower))
            );
        }

        return await query.Select(s => new SalleDto {
            Id = s.Id,
            Numero = s.NomSalle ?? "Sans nom",
            Batiment = s.Batiment ?? "Inconnu",
            Etage = s.Etage,
            Statut = "LIBRE" // Valeur par défaut, à lier plus tard à l'EDT
        }).ToListAsync();
    }

    public async Task<List<string>> GetUniqueBatiments()
    {
        return await _context.Salles
            .Where(s => s.Batiment != null) // Filtre les nulls pour éviter les erreurs de mapping
            .Select(s => s.Batiment!)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync();
    }

    public async Task<List<int>> GetUniqueEtages()
    {
        return await _context.Salles
            .Select(s => s.Etage)
            .Distinct()
            .OrderBy(e => e)
            .ToListAsync();
    }

    public async Task<Salle> CreateSalle(SalleDto dto)
    {
        var salle = new Salle {
            NomSalle = dto.Numero,
            Batiment = dto.Batiment,
            Etage = dto.Etage
        };
        _context.Salles.Add(salle);
        await _context.SaveChangesAsync();
        return salle;
    }

    public async Task<bool> UpdateSalle(int id, SalleDto dto)
    {
        var salle = await _context.Salles.FindAsync(id);
        if (salle == null) return false;

        salle.NomSalle = dto.Numero; // Mapping Numero (Front) -> NomSalle (DB)
        salle.Batiment = dto.Batiment;
        salle.Etage = dto.Etage;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteSalle(int id)
    {
        var salle = await _context.Salles.FindAsync(id);
        if (salle == null) return false;

        _context.Salles.Remove(salle);
        await _context.SaveChangesAsync();
        return true;
    }
}