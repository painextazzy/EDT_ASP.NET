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

        // Changer le paramètre etage de int? à string?
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

            // Directement en string
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

        public async Task<Salle> CreateSalle(Salle salle)
        {
            _context.Salles.Add(salle);
            await _context.SaveChangesAsync();
            return salle;
        }

        public async Task<Salle?> UpdateSalle(int id, Salle salle)
        {
            var existing = await _context.Salles.FindAsync(id);
            if (existing == null) return null;

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