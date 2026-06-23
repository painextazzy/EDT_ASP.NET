// back/Controllers/DashboardController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos;
using back.Models;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(AppDbContext context, ILogger<DashboardController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats([FromQuery] string period = "month")
    {
        try
        {
            // Récupérer toutes les données nécessaires
            var enseignants = await _context.Enseignants.ToListAsync();
            var matieres = await _context.Matieres.ToListAsync();
            var salles = await _context.Salles.ToListAsync();

            // Récupérer les plannings avec leurs relations
            var allPlannings = await _context.Plannings
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Cours)
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Enseignant)
                .ToListAsync();

            // Filtrer les plannings selon la période
            var plannings = FilterPlanningsByPeriod(allPlannings, period);

            // Récupérer les relations Planning_Salle séparément
            var planningSalles = await _context.PlanningSalles.ToListAsync();

            var enseignements = await _context.Enseignements
                .Include(e => e.Cours)
                .Include(e => e.Enseignant)
                .Include(e => e.Niveau)
                .Include(e => e.Parcours)
                .ToListAsync();

            var delegues = await _context.Delegues.ToListAsync();

            // 1. Statistiques générales
            var totalEnseignants = enseignants.Count;
            var totalMatieres = matieres.Count;
            var totalSalles = salles.Count;
            var totalPlannings = plannings.Count;
            var totalEnseignements = enseignements.Count;
            var totalDelegues = delegues.Count;

            // 2. Statut des plannings
            var planningsActifs = plannings.Count(p => p.Statut == "Actif");
            var planningsAnnules = plannings.Count(p => p.Statut == "Annule");
            var planningsReportes = plannings.Count(p => p.Statut == "Reporte");

            // 3. Types d'événements
            var coursCount = plannings.Count(p => p.TypeEvenement == "Cours");
            var examensCount = plannings.Count(p => p.TypeEvenement == "Examen");
            var soutenancesCount = plannings.Count(p => p.TypeEvenement == "Soutenance");

            // 4. Cours terminés
            var coursTermines = enseignements.Count(e => e.EstTermine);

            // 5. Planning du jour
            var today = DateTime.Today;
            var todayPlannings = plannings
                .Where(p => p.DateDebut.Date == today && p.Statut != "Annule")
                .OrderBy(p => p.DateDebut)
                .Take(5)
                .Select(p => new
                {
                    enseignant = p.Enseignement?.Enseignant?.Nom ?? "Non défini",
                    horaire = $"{p.DateDebut:HH:mm} - {p.DateFin:HH:mm}",
                    matiere = p.Enseignement?.Cours?.Nom ?? "Cours non défini",
                    type = p.TypeEvenement ?? "Cours",
                    salle = GetSalleNames(p.Id, planningSalles, salles),
                    statut = p.Statut ?? "Actif"
                })
                .ToList();

            // 6. Top Salles
            var topSalles = planningSalles
                .GroupBy(ps => ps.IdSalle)
                .Select(g => new { salleId = g.Key, count = g.Count() })
                .Join(salles,
                    ps => ps.salleId,
                    s => s.Id,
                    (ps, s) => new { name = s.Numero ?? s.Batiment ?? "Salle", count = ps.count })
                .OrderByDescending(x => x.count)
                .Take(5)
                .Select(x => new
                {
                    name = x.name,
                    count = x.count,
                    rate = totalPlannings > 0 ? (int)Math.Round((double)x.count / totalPlannings * 100) : 0
                })
                .ToList();

            // 7. Cours annulés (historique)
            var cancelledCourses = plannings
                .Where(p => p.Statut == "Annule")
                .OrderByDescending(p => p.DateDebut)
                .Take(4)
                .Select(p => new
                {
                    name = $"{p.Enseignement?.Cours?.Nom ?? "Cours"}",
                    status = p.MotifAnnulation ?? "Annulé",
                    date = p.DateDebut.ToString("dd/MM/yyyy"),
                    enseignant = p.Enseignement?.Enseignant?.Nom ?? "Non défini"
                })
                .ToList();

            // 8. Événements par mois (pour la courbe)
            var monthlyEvents = new List<object>();
            
            if (period.ToLower() == "day")
            {
                // Afficher par heure
                var hourNames = Enumerable.Range(0, 24).Select(h => $"{h:D2}:00").ToList();
                var startDate = DateTime.Now.Date;
                for (int i = 0; i < 24; i++)
                {
                    var hour = startDate.AddHours(i);
                    var count = plannings.Count(p => p.DateDebut.Hour == i);
                    monthlyEvents.Add(new { month = hourNames[i], count = count });
                }
            }
            else if (period.ToLower() == "week")
            {
                // Afficher par jour de la semaine
                var dayNames = new[] { "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim" };
                var startOfWeek = DateTime.Now.Date;
                if (startOfWeek.DayOfWeek != DayOfWeek.Monday)
                {
                    var daysToSubtract = (int)startOfWeek.DayOfWeek == 0 ? 6 : (int)startOfWeek.DayOfWeek - 1;
                    startOfWeek = startOfWeek.AddDays(-daysToSubtract);
                }
                for (int i = 0; i < 7; i++)
                {
                    var date = startOfWeek.AddDays(i);
                    var count = plannings.Count(p => p.DateDebut.Date == date);
                    monthlyEvents.Add(new { month = dayNames[i], count = count });
                }
            }
            else
            {
                // Afficher par mois (par défaut)
                var monthNames = new[] { "Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc" };
                var currentYear = DateTime.Now.Year;
                for (int i = 0; i < 12; i++)
                {
                    var count = allPlannings.Count(p => p.DateDebut.Month == i + 1 && p.DateDebut.Year == currentYear);
                    monthlyEvents.Add(new { month = monthNames[i], count = count });
                }
            }

            // 9. Charge des enseignants (Top 5)
            var teacherLoad = plannings
                .Where(p => p.Enseignement?.Enseignant != null)
                .GroupBy(p => p.Enseignement.Enseignant.Nom)
                .Select(g => new { name = g.Key, count = g.Count() })
                .OrderByDescending(x => x.count)
                .Take(5)
                .Select(x => new
                {
                    name = x.name,
                    count = x.count,
                    percentage = totalPlannings > 0 ? (int)Math.Round((double)x.count / totalPlannings * 100) : 0
                })
                .ToList();

            // 10. Historique des sauvegardes (à partir des plannings récents)
            var backupHistory = plannings
                .OrderByDescending(p => p.DateDebut)
                .Take(3)
                .Select(p => new
                {
                    name = $"{p.Enseignement?.Cours?.Nom ?? "Planning"}_{p.DateDebut:ddMMyyyy}.pdf",
                    time = GetRelativeTime(p.DateDebut),
                    icon = "FileIcon",
                    color = p.Statut == "Actif" ? "text-emerald-500 bg-emerald-50" : "text-amber-500 bg-amber-50"
                })
                .ToList();

            // Si pas de plannings, ajouter des données par défaut
            if (!backupHistory.Any())
            {
                backupHistory.Add(new { name = "Planning_S2_Final.pdf", time = "Il y a 2 heures", icon = "FileIcon", color = "text-emerald-500 bg-emerald-50" });
                backupHistory.Add(new { name = "Liste_Enseignants.xlsx", time = "Hier, 15:30", icon = "FileSpreadsheet", color = "text-blue-500 bg-blue-50" });
                backupHistory.Add(new { name = "Note_Service_Nov.docx", time = "3 Nov 2023", icon = "FileCode", color = "text-amber-500 bg-amber-50" });
            }

            // 11. Répartition des événements
            var distribution = new
            {
                cours = coursCount,
                examens = examensCount,
                tp = soutenancesCount,
                total = totalPlannings
            };

            // Retourner toutes les données
            return Ok(new
            {
                stats = new
                {
                    planning = totalPlannings,
                    enseignants = totalEnseignants,
                    affectations = totalEnseignements,
                    cours = coursCount,
                    salles = totalSalles,
                    annules = planningsAnnules,
                    delegues = totalDelegues,
                    coursTermines = coursTermines,
                    reportes = planningsReportes
                },
                todaySchedule = todayPlannings,
                topSalles = topSalles,
                cancelledCourses = cancelledCourses,
                monthlyEvents = monthlyEvents,
                teacherLoad = teacherLoad,
                backupHistory = backupHistory,
                distribution = distribution
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des statistiques du dashboard");
            return StatusCode(500, new { message = "Erreur lors du chargement des données", error = ex.Message });
        }
    }

    private string GetSalleNames(int planningId, List<PlanningSalle> planningSalles, List<Salle> salles)
    {
        var salleIds = planningSalles
            .Where(ps => ps.IdPlanning == planningId)
            .Select(ps => ps.IdSalle)
            .ToList();

        var salleNames = salles
            .Where(s => salleIds.Contains(s.Id))
            .Select(s => s.Numero ?? s.Batiment)
            .ToList();

        return salleNames.Any() ? string.Join(", ", salleNames) : "Salle non définie";
    }

    private string GetRelativeTime(DateTime date)
    {
        var diff = DateTime.Now - date;

        if (diff.TotalMinutes < 60)
            return $"Il y a {(int)diff.TotalMinutes} minute{(diff.TotalMinutes > 1 ? "s" : "")}";
        if (diff.TotalHours < 24)
            return $"Il y a {(int)diff.TotalHours} heure{(diff.TotalHours > 1 ? "s" : "")}";
        if (diff.TotalDays < 7)
            return $"Il y a {(int)diff.TotalDays} jour{(diff.TotalDays > 1 ? "s" : "")}";

        return date.ToString("dd/MM/yyyy");
    }

    private List<Planning> FilterPlanningsByPeriod(List<Planning> plannings, string period)
    {
        var now = DateTime.Now;
        var startDate = DateTime.MinValue;
        var endDate = DateTime.MaxValue;

        switch (period.ToLower())
        {
            case "day":
                startDate = now.Date;
                endDate = now.Date.AddDays(1).AddTicks(-1);
                break;
            case "week":
                var daysToSubtract = (int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1;
                startDate = now.Date.AddDays(-daysToSubtract);
                endDate = startDate.AddDays(7).AddTicks(-1);
                break;
            case "month":
                startDate = new DateTime(now.Year, now.Month, 1);
                endDate = startDate.AddMonths(1).AddTicks(-1);
                break;
            default:
                return plannings;
        }

        return plannings
            .Where(p => p.DateDebut >= startDate && p.DateDebut <= endDate)
            .ToList();
    }
}
