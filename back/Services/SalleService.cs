// Services/SalleService.cs
using back.Data;
using back.Models;
using Microsoft.EntityFrameworkCore;

namespace back.Services
{
    public class SalleService
    {
        private readonly AppDbContext _context;

        public SalleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Salle>> GetAllSalles(string? batiment, string? etage, string? search)
        {
            var query = _context.Salles.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(s => s.Numero.Contains(search));
            }

            if (!string.IsNullOrEmpty(batiment))
            {
                query = query.Where(s => s.Batiment == batiment);
            }

            if (!string.IsNullOrEmpty(etage))
            {
                query = query.Where(s => s.Etage == etage);
            }

            return await query.ToListAsync();
        }

        public async Task<List<string>> GetBatiments()
        {
            return await _context.Salles
                .Select(s => s.Batiment)
                .Distinct()
                .OrderBy(b => b)
                .ToListAsync();
        }

        // Vérification si une salle existe
        public async Task<bool> SalleExists(string numero)
        {
            return await _context.Salles.AnyAsync(s => s.Numero == numero);
        }

        // Vérification si une salle existe (excluant un ID)
        public async Task<bool> SalleExistsExcludingId(string numero, int excludeId)
        {
            return await _context.Salles.AnyAsync(s => s.Numero == numero && s.Id != excludeId);
        }

        public async Task<Salle?> CreateSalle(Salle salle)
        {
            // Vérification avant insertion
            var exists = await SalleExists(salle.Numero);
            if (exists)
            {
                return null; // La salle existe déjà
            }

            _context.Salles.Add(salle);
            await _context.SaveChangesAsync();
            return salle;
        }

        public async Task<Salle?> UpdateSalle(int id, Salle salle)
        {
            var existing = await _context.Salles.FindAsync(id);
            if (existing == null) return null;

            // Vérification avant modification (si le numéro change)
            if (existing.Numero != salle.Numero)
            {
                var exists = await SalleExistsExcludingId(salle.Numero, id);
                if (exists)
                {
                    return null; // Une autre salle a déjà ce numéro
                }
            }

            existing.Numero = salle.Numero;
            existing.Batiment = salle.Batiment;
            existing.Etage = salle.Etage;
            existing.Statut = salle.Statut;
            existing.CourActuel = salle.CourActuel;

            await _context.SaveChangesAsync();
            return existing;
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
}