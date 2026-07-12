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

                // ✅ Recharger le planning avec toutes les relations
                var planningWithDetails = await _service.GetPlanningWithDetailsAsync(planning.Id);

                // ✅ NOTIFICATION ENSEIGNANT (création) - UTILISER planningWithDetails
                await NotifyTeacherAsync(planningWithDetails, "create");  // ← CHANGEMENT ICI

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
                var oldPlanning = await _service.GetPlanningWithDetailsAsync(id);
                if (oldPlanning == null)
                    return NotFound(new { message = "Événement non trouvé" });

                var planning = await _service.UpdateAsync(id, dto);

                var newPlanning = await _service.GetPlanningWithDetailsAsync(id);
                if (newPlanning != null)
                {
                    // ✅ NOTIFICATION ENSEIGNANT (modification)
                    await NotifyTeacherAsync(newPlanning, "update");
                    await NotifyPlanningUpdated(oldPlanning, newPlanning);
                }

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
                var planning = await _service.GetPlanningWithDetailsAsync(id);
                if (planning == null)
                    return NotFound(new { message = "Événement non trouvé" });

                await NotifyPlanningDeleted(planning);
                await _service.DeleteAsync(id);
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

                await NotifyPlanningDeleted(planning);
                await _service.AnnulerAsync(id, dto.Motif);
                var updatedPlanning = await _service.GetPlanningWithDetailsAsync(id);

                // ✅ NOTIFICATION ENSEIGNANT (annulation)
                await NotifyTeacherAsync(updatedPlanning, "cancel");

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

        // ✅ Terminer un cours (statut = "Termine")
        [HttpPatch("{id}/terminer")]
        public async Task<IActionResult> Terminer(int id)
        {
            try
            {
                var planning = await _service.TerminerAsync(id);
                var planningWithDetails = await _service.GetPlanningWithDetailsAsync(id);

                // ✅ NOTIFICATION ENSEIGNANT (terminaison)
                if (planningWithDetails != null)
                    await NotifyTeacherAsync(planningWithDetails, "complete");

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

        /// <summary>
        /// Notifie l'enseignant concerné par un changement de planning
        /// </summary>
        private async Task NotifyTeacherAsync(Planning? planning, string action)
        {
            try
            {
                if (planning == null)
                {
                    Console.WriteLine($"⚠️ Aucun planning fourni pour l'action {action}");
                    return;
                }

                // Récupérer l'utilisateur associé à l'enseignant du planning
                var utilisateur = planning.Enseignement?.Enseignant?.Utilisateur;
                if (utilisateur == null)
                {
                    Console.WriteLine($"⚠️ Aucun utilisateur trouvé pour le planning {planning.Id}");
                    return;
                }

                var userId = utilisateur.Id;
                var courseName = planning.Enseignement?.Cours?.Nom ?? "Cours";
                var data = new
                {
                    planningId = planning.Id,
                    titre = courseName,
                    dateDebut = planning.DateDebut,
                    dateFin = planning.DateFin,
                    statut = planning.Statut,
                    action = action,
                    userId = userId,
                    message = action switch
                    {
                        "create" => $"Le cours {courseName} a été ajouté à votre emploi du temps",
                        "update" => $"Le cours {courseName} a été modifié dans votre emploi du temps",
                        "cancel" => $"Le cours {courseName} a été annulé",
                        "complete" => $"Le cours {courseName} a été marqué comme terminé",
                        _ => $"Le cours {courseName} a été mis à jour"
                    }
                };

                // Envoyer la notification uniquement à l'utilisateur concerné
                await _hubContext.Clients.User(userId.ToString()).SendAsync("PlanningNotification", data);
                await _hubContext.Clients.User(userId.ToString()).SendAsync("NewPlanningNotification", data);
                Console.WriteLine($"📢 Notification envoyée à l'utilisateur {userId} pour l'action {action} (planning {planning.Id})");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erreur notification enseignant: {ex.Message}");
            }
        }

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

                if (!etaitEnCours && estEnCours)
                    await NotifierSalleOccupee(newPlanning);
                else if (etaitEnCours && !estEnCours)
                    await NotifierSalleLibre(oldPlanning);
                else if (estEnCours && etaitEnCours)
                {
                    var oldSalles = oldPlanning.PlanningSalles?.Select(ps => ps.IdSalle).ToList() ?? new List<int>();
                    var newSalles = newPlanning.PlanningSalles?.Select(ps => ps.IdSalle).ToList() ?? new List<int>();

                    var sallesAjoutees = newSalles.Except(oldSalles).ToList();
                    var sallesRetirees = oldSalles.Except(newSalles).ToList();

                    if (sallesAjoutees.Any())
                        await NotifierSalleOccupee(newPlanning, sallesAjoutees);
                    if (sallesRetirees.Any())
                        await NotifierSalleLibre(oldPlanning, sallesRetirees);
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
                salles = await _service.GetSallesByIdsAsync(salleIds);
            else if (planning.PlanningSalles != null && planning.PlanningSalles.Any())
                salles = planning.PlanningSalles.Select(ps => ps.Salle).Where(s => s != null).ToList();

            if (!salles.Any())
                salles = await _service.GetSallesByPlanningIdAsync(planning.Id);

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
                salles = await _service.GetSallesByIdsAsync(salleIds);
            else if (planning.PlanningSalles != null && planning.PlanningSalles.Any())
                salles = planning.PlanningSalles.Select(ps => ps.Salle).Where(s => s != null).ToList();

            if (!salles.Any())
                salles = await _service.GetSallesByPlanningIdAsync(planning.Id);

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
        [HttpGet("test-user/{userId}")]
        public async Task<IActionResult> TestUserNotification(int userId)
        {
            var data = new { message = $"Test pour l'utilisateur {userId}", date = DateTime.UtcNow };
            await _hubContext.Clients.User(userId.ToString()).SendAsync("NewPlanningNotification", data);
            return Ok($"Notification envoyée à l'utilisateur {userId}");
        }
    }
}