using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos;
using back.Models;

namespace back.Services;

public class DelegueService
{
    private readonly AppDbContext _context;

    public DelegueService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<DelegueDto>> GetAllAsync()
    {
        return await _context.Delegues
            .Include(d => d.Niveau)
            .Include(d => d.Parcours)
            .Select(d => new DelegueDto
            {
                Id = d.Id,
                NomDelegue = d.NomDelegue,
                EmailDelegue = d.EmailDelegue,
                IdNiveau = d.IdNiveau,
                NiveauLibelle = d.Niveau.Libelle,
                IdParcours = d.IdParcours,
                ParcoursLibelle = d.Parcours.Libelle
            })
            .ToListAsync();
    }

    public async Task<string> CreateAsync(CreateDelegueDto dto)
    {
        var exists = await _context.Delegues.AnyAsync(d => d.IdNiveau == dto.IdNiveau && d.IdParcours == dto.IdParcours);
        if (exists) throw new Exception("Cette classe possède déjà un délégué.");

        var delegue = new Delegue
        {
            NomDelegue = dto.NomDelegue,
            EmailDelegue = dto.EmailDelegue,
            IdNiveau = dto.IdNiveau,
            IdParcours = dto.IdParcours
        };

        _context.Delegues.Add(delegue);
        await _context.SaveChangesAsync();
        return "Délégué ajouté avec succès";
    }

    public async Task<string> UpdateAsync(int id, CreateDelegueDto dto)
    {
        var delegue = await _context.Delegues.FindAsync(id);
        if (delegue == null) throw new KeyNotFoundException("Délégué non trouvé");

        if (delegue.IdNiveau != dto.IdNiveau || delegue.IdParcours != dto.IdParcours)
        {
            var exists = await _context.Delegues.AnyAsync(d => d.Id != id && d.IdNiveau == dto.IdNiveau && d.IdParcours == dto.IdParcours);
            if (exists) throw new Exception("La destination possède déjà un délégué.");
        }

        delegue.NomDelegue = dto.NomDelegue;
        delegue.EmailDelegue = dto.EmailDelegue;
        delegue.IdNiveau = dto.IdNiveau;
        delegue.IdParcours = dto.IdParcours;

        await _context.SaveChangesAsync();
        return "Délégué mis à jour avec succès";
    }

    public async Task DeleteAsync(int id)
    {
        var delegue = await _context.Delegues.FindAsync(id);
        if (delegue != null) { _context.Delegues.Remove(delegue); await _context.SaveChangesAsync(); }
    }
}