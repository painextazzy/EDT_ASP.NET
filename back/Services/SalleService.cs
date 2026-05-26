using GestionSalles.API.Data;
using GestionSalles.API.DTOs;
using GestionSalles.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionSalles.API.Services;

public class SalleService : ISalleService
{
    private readonly AppDbContext _db;

    public SalleService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<SalleDto>> GetAllAsync(string? batiment, int? etage, string? search)
    {
        var query = _db.Salles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(batiment))
            query = query.Where(s => s.Batiment == batiment);

        if (etage.HasValue)
            query = query.Where(s => s.Etage == etage.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                x.NomSalle.ToLower().Contains(s) ||
                x.Batiment.ToLower().Contains(s));
        }

        return await query
            .OrderBy(s => s.Batiment)
            .ThenBy(s => s.Etage)
            .ThenBy(s => s.NomSalle)
            .Select(s => ToDto(s))
            .ToListAsync();
    }

    public async Task<SalleDto?> GetByIdAsync(int id)
    {
        var salle = await _db.Salles.FindAsync(id);
        return salle == null ? null : ToDto(salle);
    }

    public async Task<IEnumerable<string>> GetBatimentsAsync()
    {
        return await _db.Salles
            .Select(s => s.Batiment)
            .Distinct()
            .OrderBy(b => b)
            .ToListAsync();
    }

    public async Task<IEnumerable<int>> GetEtagesAsync()
    {
        return await _db.Salles
            .Select(s => s.Etage)
            .Distinct()
            .OrderBy(e => e)
            .ToListAsync();
    }

    public async Task<SalleDto> CreateAsync(CreateSalleDto dto)
    {
        var salle = new Salle
        {
            NomSalle = dto.NomSalle.Trim(),
            Batiment = dto.Batiment.Trim(),
            Etage = dto.Etage,
        };
        _db.Salles.Add(salle);
        await _db.SaveChangesAsync();
        return ToDto(salle);
    }

    public async Task<SalleDto?> UpdateAsync(int id, UpdateSalleDto dto)
    {
        var salle = await _db.Salles.FindAsync(id);
        if (salle == null) return null;

        if (dto.NomSalle != null) salle.NomSalle = dto.NomSalle.Trim();
        if (dto.Batiment != null) salle.Batiment = dto.Batiment.Trim();
        if (dto.Etage.HasValue) salle.Etage = dto.Etage.Value;

        await _db.SaveChangesAsync();
        return ToDto(salle);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var salle = await _db.Salles.FindAsync(id);
        if (salle == null) return false;
        _db.Salles.Remove(salle);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ExistsAsync(string nomSalle, string batiment, int? excludeId = null)
    {
        return await _db.Salles.AnyAsync(s =>
            s.NomSalle.ToLower() == nomSalle.Trim().ToLower() &&
            s.Batiment.ToLower() == batiment.Trim().ToLower() &&
            (excludeId == null || s.Id != excludeId));
    }

    private static SalleDto ToDto(Salle s) => new()
    {
        Id = s.Id,
        NomSalle = s.NomSalle,
        Batiment = s.Batiment,
        Etage = s.Etage,
    };
}