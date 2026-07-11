// back/Controllers/PlanningController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using back.Services;
using back.Dtos;
using back.Hubs;
using back.Models;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlanningController : ControllerBase
    {
        private readonly PlanningService _service;
        private readonly IHubContext<MainHub> _hubContext;

        public PlanningController(PlanningService service, IHubContext<MainHub> hubContext)
        {
            _service = service;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var plannings = await _service.GetAllAsync();
                return Ok(plannings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpGet("enseignant/{enseignantId}")]
        public async Task<IActionResult> GetPlanningsByEnseignant(int enseignantId)
        {
            try
            {
                if (enseignantId <= 0)
                    return BadRequest(new { message = "L'ID de l'enseignant est requis et doit être positif" });

                var plannings = await _service.GetPlanningsByEnseignantAsync(enseignantId);
                Console.WriteLine($"📊 Plannings trouvés pour enseignant {enseignantId}: {plannings.Count}");
                return Ok(new
                {
                    success = true,
                    data = plannings,
                    count = plannings.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur: {ex.Message}");
                return StatusCode(500, new { message = $"Erreur lors de la récupération des plannings : {ex.Message}" });
            }
        }

        // ========== CRUD ==========

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PlanningDto dto)
        {
            try
            {
                var planning = await _service.CreateAsync(dto);

                // 🔔 NOTIFIER - Si le cours est en cours
                await NotifyPlanningCreated(planning);

                // 🔔 NOTIFIER - Rafraîchir toutes les salles
                await _hubContext.Clients.All.SendAsync("RefreshSalles");

                return Ok(new
                {
                    message = "Événement créé avec succès",
                    id = planning.Id
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("occupée") || ex.Message.Contains("professeur"))
                    return Conflict(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PlanningDto dto)
        {
            try
            {
                // Récupérer l'ancien planning AVANT modification
                var oldPlanning = await _service.GetPlanningWithDetailsAsync(id);
                if (oldPlanning == null)
                    return NotFound(new { message = "Événement non trouvé" });

                var planning = await _service.UpdateAsync(id, dto);

                // Récupérer le nouveau planning complet
                var newPlanning = await _service.GetPlanningWithDetailsAsync(id);
                if (newPlanning != null)
                {
                    await NotifyPlanningUpdated(oldPlanning, newPlanning);
                }

                // 🔔 NOTIFIER - Rafraîchir toutes les salles
                await _hubContext.Clients.All.SendAsync("RefreshSalles");

                return Ok(new
                {
                    message = "Événement mis à jour avec succès",
                    id = planning.Id
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("occupée") || ex.Message.Contains("professeur"))
                    return Conflict(new { message = ex.Message });

                if (ex.Message.Contains("non trouvé"))
                    return NotFound(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                // Récupérer le planning AVANT suppression
                var planning = await _service.GetPlanningWithDetailsAsync(id);
                if (planning == null)
                    return NotFound(new { message = "Événement non trouvé" });

                // 🔔 NOTIFIER - Si le cours était en cours, libérer la salle
                await NotifyPlanningDeleted(planning);

                // Supprimer le planning
                await _service.DeleteAsync(id);

                // 🔔 NOTIFIER - Rafraîchir toutes les salles
                await _hubContext.Clients.All.SendAsync("RefreshSalles");

                return Ok(new { message = "Événement supprimé avec succès" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("non trouvé"))
                    return NotFound(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        // ========== ACTIONS SPÉCIFIQUES ==========

        [HttpPatch("{id}/annuler")]
        public async Task<IActionResult> Annuler(int id, [FromBody] AnnulerPlanningDto dto)
        {
            try
            {
                var planning = await _service.GetPlanningWithDetailsAsync(id);
                if (planning == null)
                    return NotFound(new { message = "Événement non trouvé" });

                // 🔔 NOTIFIER - Si le cours était en cours, libérer la salle
                await NotifyPlanningDeleted(planning);

                await _service.AnnulerAsync(id, dto.Motif);

                // 🔔 NOTIFIER - Rafraîchir toutes les salles
                await _hubContext.Clients.All.SendAsync("RefreshSalles");

                return Ok(new { message = "Événement annulé avec succès" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("non trouvé"))
                    return NotFound(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ NOUVEAU : Terminer un cours (statut = "Termine")
        [HttpPatch("{id}/terminer")]
        public async Task<IActionResult> Terminer(int id)
        {
            try
            {
                var planning = await _service.TerminerAsync(id);
                return Ok(new { message = "Cours terminé avec succès", statut = planning.Statut });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("non trouvé"))
                    return NotFound(new { message = ex.Message });
                return BadRequest(new { message = ex.Message });
            }
        }

        // ========== MÉTHODES DE NOTIFICATION ==========

        private async Task NotifyPlanningCreated(Planning planning)
        {
            try
            {
                var maintenant = DateTime.UtcNow;

                if (planning.DateDebut.ToUniversalTime() <= maintenant &&
                    planning.DateFin.ToUniversalTime() >= maintenant)
                {
                    await NotifierSalleOccupee(planning);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur notification création: {ex.Message}");
            }
        }

        private async Task NotifyPlanningUpdated(Planning oldPlanning, Planning newPlanning)
        {
            try
            {
                var maintenant = DateTime.UtcNow;
                var etaitEnCours = oldPlanning.DateDebut.ToUniversalTime() <= maintenant &&
                                  oldPlanning.DateFin.ToUniversalTime() >= maintenant;
                var estEnCours = newPlanning.DateDebut.ToUniversalTime() <= maintenant &&
                                newPlanning.DateFin.ToUniversalTime() >= maintenant;

                // Cas 1: Le cours vient de commencer
                if (!etaitEnCours && estEnCours)
                {
                    await NotifierSalleOccupee(newPlanning);
                }
                // Cas 2: Le cours vient de se terminer
                else if (etaitEnCours && !estEnCours)
                {
                    await NotifierSalleLibre(oldPlanning);
                }
                // Cas 3: Changement de salle
                else if (estEnCours && etaitEnCours)
                {
                    var oldSalles = oldPlanning.PlanningSalles?.Select(ps => ps.IdSalle).ToList() ?? new List<int>();
                    var newSalles = newPlanning.PlanningSalles?.Select(ps => ps.IdSalle).ToList() ?? new List<int>();

                    var sallesAjoutees = newSalles.Except(oldSalles).ToList();
                    var sallesRetirees = oldSalles.Except(newSalles).ToList();

                    if (sallesAjoutees.Any())
                    {
                        await NotifierSalleOccupee(newPlanning, sallesAjoutees);
                    }

                    if (sallesRetirees.Any())
                    {
                        await NotifierSalleLibre(oldPlanning, sallesRetirees);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur notification modification: {ex.Message}");
            }
        }

        private async Task NotifyPlanningDeleted(Planning planning)
        {
            try
            {
                var maintenant = DateTime.UtcNow;

                if (planning.DateDebut.ToUniversalTime() <= maintenant &&
                    planning.DateFin.ToUniversalTime() >= maintenant)
                {
                    await NotifierSalleLibre(planning);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur notification suppression: {ex.Message}");
            }
        }

        private async Task NotifierSalleOccupee(Planning planning, List<int>? salleIds = null)
        {
            List<Salle> salles = new List<Salle>();

            if (salleIds != null && salleIds.Any())
            {
                salles = await _service.GetSallesByIdsAsync(salleIds);
            }
            else if (planning.PlanningSalles != null && planning.PlanningSalles.Any())
            {
                salles = planning.PlanningSalles.Select(ps => ps.Salle).Where(s => s != null).ToList();
            }

            if (!salles.Any())
            {
                salles = await _service.GetSallesByPlanningIdAsync(planning.Id);
            }

            foreach (var salle in salles)
            {
                if (salle == null) continue;

                var data = new
                {
                    id = salle.Id,
                    numero = salle.Numero,
                    batiment = salle.Batiment,
                    etage = salle.Etage,
                    statut = "OCCUPÉ",
                    estOccupee = true,
                    courActuel = planning.Enseignement?.Cours?.Nom ?? "Cours",
                    enseignant = planning.Enseignement?.Enseignant?.Nom ?? "Enseignant",
                    horaire = $"{planning.DateDebut.ToUniversalTime():HH:mm} - {planning.DateFin.ToUniversalTime():HH:mm}"
                };

                await _hubContext.Clients.All.SendAsync("SalleUpdated", data);
                Console.WriteLine($"🔴 Salle {salle.Numero} occupée: {planning.Enseignement?.Cours?.Nom}");
            }
        }

        private async Task NotifierSalleLibre(Planning planning, List<int>? salleIds = null)
        {
            List<Salle> salles = new List<Salle>();

            if (salleIds != null && salleIds.Any())
            {
                salles = await _service.GetSallesByIdsAsync(salleIds);
            }
            else if (planning.PlanningSalles != null && planning.PlanningSalles.Any())
            {
                salles = planning.PlanningSalles.Select(ps => ps.Salle).Where(s => s != null).ToList();
            }

            if (!salles.Any())
            {
                salles = await _service.GetSallesByPlanningIdAsync(planning.Id);
            }

            foreach (var salle in salles)
            {
                if (salle == null) continue;

                var data = new
                {
                    id = salle.Id,
                    numero = salle.Numero,
                    batiment = salle.Batiment,
                    etage = salle.Etage,
                    statut = "LIBRE",
                    estOccupee = false,
                    courActuel = (string?)null,
                    enseignant = (string?)null,
                    horaire = (string?)null
                };

                await _hubContext.Clients.All.SendAsync("SalleUpdated", data);
                Console.WriteLine($"🟢 Salle {salle.Numero} libérée");
            }
        }

        // ========== ENDPOINTS DE VÉRIFICATION ==========

        [HttpGet("check-professeur")]
        public async Task<IActionResult> CheckProfesseur(
            [FromQuery] int professeurId,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] int? excludeId = null)
        {
            try
            {
                if (professeurId <= 0)
                    return BadRequest(new { message = "L'ID du professeur est requis" });

                // Convertir en UTC pour PostgreSQL
                var startUtc = start.ToUniversalTime();
                var endUtc = end.ToUniversalTime();

                var disponible = await _service.IsProfesseurAvailableAsync(professeurId, startUtc, endUtc, excludeId);

                return Ok(new
                {
                    disponible = disponible,
                    message = disponible ? "Professeur disponible" : "Le professeur a déjà un cours sur cette tranche horaire"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la vérification : {ex.Message}" });
            }
        }

        [HttpGet("check-salle")]
        public async Task<IActionResult> CheckSalle(
            [FromQuery] string salleNom,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] int? excludeId = null)
        {
            try
            {
                if (string.IsNullOrEmpty(salleNom))
                    return BadRequest(new { message = "Le nom de la salle est requis" });

                var salle = await _service.GetSalleByNumeroAsync(salleNom);
                if (salle == null)
                    return Ok(new
                    {
                        disponible = true,
                        message = "Salle non trouvée, considérée comme disponible"
                    });

                var startUtc = start.ToUniversalTime();
                var endUtc = end.ToUniversalTime();

                var disponible = await _service.IsSalleAvailableAsync(salle.Id, startUtc, endUtc, excludeId);

                return Ok(new
                {
                    disponible = disponible,
                    message = disponible ? $"La salle {salleNom} est disponible" : $"La salle {salleNom} est déjà occupée sur cette tranche horaire",
                    salle = new { id = salle.Id, nom = salle.Numero }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la vérification : {ex.Message}" });
            }
        }

        [HttpGet("check-salle-by-id")]
        public async Task<IActionResult> CheckSalleById(
            [FromQuery] int salleId,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] int? excludeId = null)
        {
            try
            {
                if (salleId <= 0)
                    return BadRequest(new { message = "L'ID de la salle est invalide" });

                var startUtc = start.ToUniversalTime();
                var endUtc = end.ToUniversalTime();

                var disponible = await _service.IsSalleAvailableAsync(salleId, startUtc, endUtc, excludeId);

                var salle = await _service.GetSalleByIdAsync(salleId);
                var salleNom = salle?.Numero ?? $"Salle {salleId}";

                return Ok(new
                {
                    disponible = disponible,
                    message = disponible ? $"La salle {salleNom} est disponible" : $"La salle {salleNom} est déjà occupée sur cette tranche horaire"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la vérification : {ex.Message}" });
            }
        }
    }
}