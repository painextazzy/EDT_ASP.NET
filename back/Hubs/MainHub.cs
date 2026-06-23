// back/Hubs/MainHub.cs
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using back.Data;

namespace back.Hubs
{
    public class MainHub : Hub
    {
        private readonly AppDbContext _context;
        private readonly ILogger<MainHub> _logger;

        public MainHub(AppDbContext context, ILogger<MainHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"✅ Client connecté: {Context.ConnectionId}");

            // 🔔 Envoyer l'état initial des salles
            await SendSalleStatus();

            await base.OnConnectedAsync();
        }

        // ========== ENVOYER L'ÉTAT DES SALLES ==========
        public async Task SendSalleStatus()
        {
            try
            {
                _logger.LogInformation("🔄 Début SendSalleStatus");

                var maintenant = DateTime.UtcNow;
                var today = DateTime.UtcNow.Date;

                var salles = await _context.Salles.ToListAsync();
                _logger.LogInformation($"📊 {salles.Count} salles trouvées");

                var planningsToday = await _context.Plannings
                    .Include(p => p.PlanningSalles)
                        .ThenInclude(ps => ps.Salle)
                    .Include(p => p.Enseignement)
                        .ThenInclude(e => e.Cours)
                    .Include(p => p.Enseignement)
                        .ThenInclude(e => e.Enseignant)
                    .Where(p => p.DateDebut.ToUniversalTime().Date == today && p.Statut == "Actif")
                    .ToListAsync();

                _logger.LogInformation($"📅 {planningsToday.Count} plannings actifs aujourd'hui");

                var result = new List<object>();

                foreach (var salle in salles)
                {
                    var planningActuel = planningsToday.FirstOrDefault(p =>
                        p.PlanningSalles.Any(ps => ps.IdSalle == salle.Id) &&
                        p.DateDebut.ToUniversalTime() <= maintenant &&
                        p.DateFin.ToUniversalTime() >= maintenant
                    );

                    result.Add(new
                    {
                        id = salle.Id,
                        numero = salle.Numero,
                        batiment = salle.Batiment,
                        etage = salle.Etage,
                        statut = planningActuel != null ? "OCCUPÉ" : "LIBRE",
                        estOccupee = planningActuel != null,
                        courActuel = planningActuel?.Enseignement?.Cours?.Nom,
                        enseignant = planningActuel?.Enseignement?.Enseignant?.Nom,
                        horaire = planningActuel != null
                            ? $"{planningActuel.DateDebut.ToUniversalTime():HH:mm} - {planningActuel.DateFin.ToUniversalTime():HH:mm}"
                            : null
                    });
                }

                _logger.LogInformation($"📤 Envoi de {result.Count} salles aux clients");

                // 🔔 Envoyer à TOUS les clients
                await Clients.All.SendAsync("SallesUpdated", result);

                _logger.LogInformation("✅ SallesUpdated envoyé avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Erreur SendSalleStatus");
                await Clients.Caller.SendAsync("OnError", new { message = ex.Message });
            }
        }

        // ========== RAFRAÎCHIR ==========
        public async Task RefreshSalles()
        {
            _logger.LogInformation("🔄 RefreshSalles appelé");
            await SendSalleStatus();
        }
    }
}