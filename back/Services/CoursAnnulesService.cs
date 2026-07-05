using Microsoft.EntityFrameworkCore;
using back.Data;

namespace back.Services
{
    public class CoursAnnulesService
    {
        private readonly AppDbContext _context;

        public CoursAnnulesService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<object>> GetAllAnnulesAsync()
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
                .Where(p => p.Statut == "Annule")
                .OrderByDescending(p => p.DateDebut)
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
    }
}
