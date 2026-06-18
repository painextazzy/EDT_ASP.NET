// Services/PlanningService.cs
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;
using back.Dtos;

namespace back.Services
{
    public class PlanningService
    {
        private readonly AppDbContext _context;

        public PlanningService(AppDbContext context)
        {
            _context = context;
        }

        // ========== VÉRIFICATIONS DE DISPONIBILITÉ ==========

        public async Task<bool> IsProfesseurAvailableAsync(int professeurId, DateTime start, DateTime end, int? excludeId = null)
        {
            var query = _context.Plannings
                .Include(p => p.Enseignement)
                .Where(p => p.Enseignement.IdEnseignant == professeurId
                    && p.Statut == "Actif"
                    && p.DateDebut < end
                    && p.DateFin > start);

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<bool> IsSalleAvailableAsync(int salleId, DateTime start, DateTime end, int? excludeId = null)
        {
            var query = _context.PlanningSalles
                .Include(ps => ps.Planning)
                .Where(ps => ps.IdSalle == salleId
                    && ps.Planning.Statut == "Actif"
                    && ps.Planning.DateDebut < end
                    && ps.Planning.DateFin > start);

            if (excludeId.HasValue)
            {
                query = query.Where(ps => ps.IdPlanning != excludeId.Value);
            }

            return !await query.AnyAsync();
        }

        public async Task<(bool IsValid, string Message)> CheckConflictsAsync(PlanningDto dto, int? excludeId = null)
        {
            var enseignement = await _context.Enseignements
                .Include(e => e.Enseignant)
                .FirstOrDefaultAsync(e => e.Id == dto.IdEnseignement);

            if (enseignement == null)
                return (false, "Enseignement non trouvé");

            // 1. Vérifier la disponibilité du professeur
            var profId = enseignement.IdEnseignant;
            if (!await IsProfesseurAvailableAsync(profId, dto.DateDebut, dto.DateFin, excludeId))
            {
                return (false, $"Le professeur {enseignement.Enseignant?.Nom} a déjà un cours sur cette tranche horaire");
            }

            // 2. Vérifier la disponibilité des salles
            foreach (var salleId in dto.IdSalles)
            {
                if (!await IsSalleAvailableAsync(salleId, dto.DateDebut, dto.DateFin, excludeId))
                {
                    var salle = await _context.Salles.FindAsync(salleId);
                    return (false, $"La salle {salle?.Numero} est déjà occupée sur cette tranche horaire");
                }
            }

            return (true, "Toutes les vérifications sont passées");
        }

        // ========== CRUD ==========

        // Récupérer tous les événements
        public async Task<List<object>> GetAllAsync()
        {
            var plannings = await _context.Plannings
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Enseignant)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Cours)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Niveau)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Parcours)
                .Include(p => p.PlanningSalles)
                    .ThenInclude(ps => ps.Salle)
                .Where(p => p.Statut == "Actif")
                .OrderBy(p => p.DateDebut)
                .ToListAsync();

            return plannings.Select(p => new
            {
                id = p.Id,
                idEnseignement = p.IdEnseignement,
                typeEvenement = p.TypeEvenement,
                statut = p.Statut,
                dateDebut = p.DateDebut,
                dateFin = p.DateFin,
                motifAnnulation = p.MotifAnnulation,
                enseignement = new
                {
                    id = p.Enseignement.Id,
                    enseignant = new
                    {
                        id = p.Enseignement.Enseignant.Id,
                        nom = p.Enseignement.Enseignant.Nom,
                        im = p.Enseignement.Enseignant.Im
                    },
                    cours = new
                    {
                        id = p.Enseignement.Cours.Id,
                        code = p.Enseignement.Cours.Code,
                        nom = p.Enseignement.Cours.Nom
                    },
                    niveau = new
                    {
                        id = p.Enseignement.Niveau.Id,
                        libelle = p.Enseignement.Niveau.Libelle
                    },
                    parcours = new
                    {
                        id = p.Enseignement.Parcours.Id,
                        libelle = p.Enseignement.Parcours.Libelle
                    }
                },
                salles = p.PlanningSalles.Select(ps => new
                {
                    id = ps.Salle.Id,
                    nom = ps.Salle.Numero,
                    batiment = ps.Salle.Batiment,
                    etage = ps.Salle.Etage
                }).ToList()
            }).Cast<object>().ToList();
        }

        // Créer un événement
        public async Task<Planning> CreateAsync(PlanningDto dto)
        {
            var enseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.Id == dto.IdEnseignement);

            if (enseignement == null)
                throw new Exception("Enseignement non trouvé");

            // Vérification des conflits avant insertion
            var (isValid, message) = await CheckConflictsAsync(dto);
            if (!isValid)
                throw new Exception(message);

            var planning = new Planning
            {
                IdEnseignement = dto.IdEnseignement,
                TypeEvenement = dto.TypeEvenement,
                Statut = "Actif",
                DateDebut = dto.DateDebut,
                DateFin = dto.DateFin,
                MotifAnnulation = dto.MotifAnnulation
            };

            _context.Plannings.Add(planning);
            await _context.SaveChangesAsync();

            foreach (var salleId in dto.IdSalles)
            {
                _context.PlanningSalles.Add(new PlanningSalle
                {
                    IdPlanning = planning.Id,
                    IdSalle = salleId
                });
            }

            await _context.SaveChangesAsync();

            return planning;
        }

        // Mettre à jour un événement
        public async Task<Planning> UpdateAsync(int id, PlanningDto dto)
        {
            // Récupérer le planning existant avec ses salles
            var planning = await _context.Plannings
                .Include(p => p.PlanningSalles)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (planning == null)
                throw new Exception("Événement non trouvé");

            // Vérifier que l'enseignement existe
            var enseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.Id == dto.IdEnseignement);

            if (enseignement == null)
                throw new Exception("Enseignement non trouvé");

            // Vérification des conflits avant mise à jour (excluant l'événement actuel)
            var (isValid, message) = await CheckConflictsAsync(dto, id);
            if (!isValid)
                throw new Exception(message);

            // Mettre à jour les propriétés
            planning.IdEnseignement = dto.IdEnseignement;
            planning.TypeEvenement = dto.TypeEvenement;
            planning.DateDebut = dto.DateDebut;
            planning.DateFin = dto.DateFin;
            planning.MotifAnnulation = dto.MotifAnnulation;

            // Supprimer les anciennes salles
            var existingSalles = _context.PlanningSalles.Where(ps => ps.IdPlanning == id);
            _context.PlanningSalles.RemoveRange(existingSalles);

            // Ajouter les nouvelles salles
            foreach (var salleId in dto.IdSalles)
            {
                _context.PlanningSalles.Add(new PlanningSalle
                {
                    IdPlanning = planning.Id,
                    IdSalle = salleId
                });
            }

            await _context.SaveChangesAsync();

            return planning;
        }

        // Supprimer un événement
        public async Task DeleteAsync(int id)
        {
            // Récupérer le planning avec ses salles
            var planning = await _context.Plannings
                .Include(p => p.PlanningSalles)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (planning == null)
                throw new Exception("Événement non trouvé");

            // Supprimer les salles associées
            var salles = _context.PlanningSalles.Where(ps => ps.IdPlanning == id);
            _context.PlanningSalles.RemoveRange(salles);

            // Supprimer le planning
            _context.Plannings.Remove(planning);

            await _context.SaveChangesAsync();
        }

        // Annuler un événement (changer le statut)
        public async Task<Planning> AnnulerAsync(int id, string motif)
        {
            var planning = await _context.Plannings.FindAsync(id);

            if (planning == null)
                throw new Exception("Événement non trouvé");

            planning.Statut = "Annule";
            planning.MotifAnnulation = motif;

            await _context.SaveChangesAsync();

            return planning;
        }
    }
}