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

        // ========== MÉTHODES POUR RÉCUPÉRER LES SALLES ==========

        public async Task<Salle> GetSalleByNumeroAsync(string numero)
        {
            return await _context.Salles
                .FirstOrDefaultAsync(s => s.Numero == numero);
        }

        public async Task<Salle> GetSalleByIdAsync(int id)
        {
            return await _context.Salles
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        // ========== MÉTHODES POUR LES NOTIFICATIONS ==========

        public async Task<Planning?> GetPlanningWithDetailsAsync(int id)
        {
            return await _context.Plannings
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Cours)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Enseignant)
                    .ThenInclude(e => e.Utilisateur)
                .Include(p => p.PlanningSalles)
                    .ThenInclude(ps => ps.Salle)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<Salle>> GetSallesByPlanningIdAsync(int planningId)
        {
            return await _context.PlanningSalles
                .Where(ps => ps.IdPlanning == planningId)
                .Select(ps => ps.Salle)
                .ToListAsync();
        }

        public async Task<List<int>> GetSalleIdsByPlanningIdAsync(int planningId)
        {
            return await _context.PlanningSalles
                .Where(ps => ps.IdPlanning == planningId)
                .Select(ps => ps.IdSalle)
                .ToListAsync();
        }

        public async Task<List<Salle>> GetSallesByIdsAsync(List<int> salleIds)
        {
            return await _context.Salles
                .Where(s => salleIds.Contains(s.Id))
                .ToListAsync();
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

            var profId = enseignement.IdEnseignant;
            if (!await IsProfesseurAvailableAsync(profId, dto.DateDebut, dto.DateFin, excludeId))
            {
                return (false, $"Le professeur {enseignement.Enseignant?.Nom} a déjà un cours sur cette tranche horaire");
            }

            foreach (var salleId in dto.IdSalles)
            {
                if (!await IsSalleAvailableAsync(salleId, dto.DateDebut, dto.DateFin, excludeId))
                {
                    var salle = await _context.Salles.FindAsync(salleId);
                    return (false, $"La salle {salle?.Numero ?? "inconnue"} est déjà occupée sur cette tranche horaire");
                }
            }

            return (true, "Toutes les vérifications sont passées");
        }

        public bool IsMultiSalleType(string typeEvenement)
        {
            return typeEvenement == "Examen" || typeEvenement == "Présentation";
        }

        // ========== CRUD ==========

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

            // Récupération des délégués pour chaque niveau
            var niveauxIds = plannings.Select(p => p.Enseignement.IdNiveau).Distinct().ToList();
            var delegues = await _context.Delegues
                .Where(d => niveauxIds.Contains(d.IdNiveau))
                .ToListAsync();

            return plannings.Select(p =>
            {
                var delegue = delegues.FirstOrDefault(d => d.IdNiveau == p.Enseignement.IdNiveau);
                return new
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
                            libelle = p.Enseignement.Niveau.Libelle,
                            delegue = delegue != null ? new
                            {
                                id = delegue.Id,
                                nom = delegue.NomDelegue,
                                email = delegue.EmailDelegue
                            } : null
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
                };
            }).Cast<object>().ToList();
        }

        // ✅ MÉTHODE CORRIGÉE : Récupérer les plannings d'un enseignant AVEC DÉLÉGUÉ
        public async Task<List<object>> GetPlanningsByEnseignantAsync(int enseignantId)
        {
            // 1. Récupérer les plannings avec toutes les relations nécessaires
            var plannings = await _context.Plannings
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Enseignant)
                    .ThenInclude(e => e.Utilisateur)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Cours)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Niveau)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Parcours)
                .Include(p => p.PlanningSalles)
                    .ThenInclude(ps => ps.Salle)
                .Where(p => p.Enseignement.IdEnseignant == enseignantId)
                .OrderBy(p => p.DateDebut)
                .ToListAsync();

            // 2. Récupérer TOUS les délégués (pour faire la correspondance en mémoire)
            //    La table Delegue est généralement petite, cette approche est simple et fiable.
            var allDelegues = await _context.Delegues.ToListAsync();

            // 3. Construire l'objet de retour avec le délégué intégré dans enseignement.niveau
            return plannings.Select(p =>
            {
                // Recherche du délégué correspondant au (Niveau, Parcours) du planning
                var delegue = allDelegues.FirstOrDefault(d =>
                    d.IdNiveau == p.Enseignement.IdNiveau &&
                    d.IdParcours == p.Enseignement.IdParcours);

                return new
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
                            libelle = p.Enseignement.Niveau.Libelle,
                            delegue = delegue != null ? new
                            {
                                id = delegue.Id,
                                nom = delegue.NomDelegue,
                                email = delegue.EmailDelegue
                            } : null
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
                };
            }).Cast<object>().ToList();
        }

        // ========== CRUD (Create, Update, Delete) ==========

        public async Task<Planning> CreateAsync(PlanningDto dto)
        {
            var enseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.Id == dto.IdEnseignement);

            if (enseignement == null)
                throw new Exception("Enseignement non trouvé");

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

        public async Task<Planning> UpdateAsync(int id, PlanningDto dto)
        {
            var planning = await _context.Plannings
                .Include(p => p.PlanningSalles)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (planning == null)
                throw new Exception("Événement non trouvé");

            // Si le statut est fourni, on met à jour UNIQUEMENT le statut
            if (!string.IsNullOrEmpty(dto.Statut))
            {
                if (dto.Statut != "Termine" && dto.Statut != "Annule" && dto.Statut != "Actif")
                    throw new Exception("Statut invalide");

                planning.Statut = dto.Statut;
                await _context.SaveChangesAsync();
                return planning;
            }

            // Sinon, mise à jour complète avec vérifications
            var enseignement = await _context.Enseignements
                .FirstOrDefaultAsync(e => e.Id == dto.IdEnseignement);

            if (enseignement == null)
                throw new Exception("Enseignement non trouvé");

            var (isValid, message) = await CheckConflictsAsync(dto, id);
            if (!isValid)
                throw new Exception(message);

            planning.IdEnseignement = dto.IdEnseignement;
            planning.TypeEvenement = dto.TypeEvenement;
            planning.DateDebut = dto.DateDebut;
            planning.DateFin = dto.DateFin;
            planning.MotifAnnulation = dto.MotifAnnulation;

            // Gestion des salles
            var existingSalles = _context.PlanningSalles.Where(ps => ps.IdPlanning == id);
            _context.PlanningSalles.RemoveRange(existingSalles);

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

        public async Task DeleteAsync(int id)
        {
            var planning = await _context.Plannings
                .Include(p => p.PlanningSalles)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (planning == null)
                throw new Exception("Événement non trouvé");

            var salles = _context.PlanningSalles.Where(ps => ps.IdPlanning == id);
            _context.PlanningSalles.RemoveRange(salles);

            _context.Plannings.Remove(planning);

            await _context.SaveChangesAsync();
        }

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

        public async Task<Planning> TerminerAsync(int id)
        {
            var planning = await _context.Plannings.FindAsync(id);
            if (planning == null)
                throw new Exception("Événement non trouvé");
            planning.Statut = "Termine";
            await _context.SaveChangesAsync();
            return planning;
        }
    }
}