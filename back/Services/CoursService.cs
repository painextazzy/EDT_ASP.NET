using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos;
using back.Models;

namespace back.Services;

public class CoursService
{
    private readonly AppDbContext _context;

    public CoursService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CoursDto>> GetAllCours()
    {
        return await _context.Matieres
            .Select(c => new CoursDto
            {
                Id = c.Id,
                Code = c.Code,
                Nom = c.Nom
            })
            .ToListAsync();
    }

    public async Task<CoursDto?> GetCoursById(int id)
    {
        var cours = await _context.Matieres.FindAsync(id);
        if (cours == null) return null;

        return new CoursDto
        {
            Id = cours.Id,
            Code = cours.Code,
            Nom = cours.Nom
        };
    }

    public async Task<Cours> CreateCours(CreateCoursDto dto)
    {
        var cours = new Cours
        {
            Code = dto.Code,
            Nom = dto.Nom
        };

        _context.Matieres.Add(cours);
        await _context.SaveChangesAsync();
        return cours;
    }

    public async Task<Cours?> UpdateCours(int id, UpdateCoursDto dto)
    {
        var cours = await _context.Matieres.FindAsync(id);
        if (cours == null) return null;

        if (!string.IsNullOrEmpty(dto.Code))
            cours.Code = dto.Code;

        if (!string.IsNullOrEmpty(dto.Nom))
            cours.Nom = dto.Nom;

        await _context.SaveChangesAsync();
        return cours;
    }

    public async Task<bool> DeleteCours(int id)
    {
        var cours = await _context.Matieres.FindAsync(id);
        if (cours == null) return false;

        var isUsed = await _context.Enseignements.AnyAsync(e => e.IdMatiere == id);
        if (isUsed) return false;

        _context.Matieres.Remove(cours);
        await _context.SaveChangesAsync();
        return true;
    }
}