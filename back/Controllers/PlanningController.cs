using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;
using back.Dtos;
using back.Hubs;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanningController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly PlanningService _service;
    private readonly IHubContext<MainHub> _hubContext;

    public PlanningController(AppDbContext context, PlanningService service, IHubContext<MainHub> hubContext)
    {
        _context = context;
        _service = service;
        _hubContext = hubContext;
    }

    // ========== GET ALL ==========
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

    // ========== GET BY ENSEIGNANT ID ==========
    [HttpGet("enseignant/{enseignantId}")]
    public async Task<IActionResult> GetByEnseignantId(int enseignantId)
    {
        try
        {
            if (enseignantId <= 0)
                return BadRequest(new { message = "L'ID de l'enseignant est requis" });

            var plannings = await _service.GetPlanningsByEnseignantIdAsync(enseignantId);
            return Ok(plannings);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
        }
    }

    // ========== CREATE ==========
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PlanningDto dto)
    {
        try
        {
            var planning = await _service.CreateAsync(dto);
            await _hubContext.Clients.All.SendAsync("RefreshSalles");
            return Ok(new { message = "Événement créé avec succès", id = planning.Id });
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("occupée") || ex.Message.Contains("professeur"))
                return Conflict(new { message = ex.Message });
            return BadRequest(new { message = ex.Message });
        }
    }

    // ========== UPDATE ==========
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] PlanningDto dto)
    {
        try
        {
            var oldPlanning = await _service.GetPlanningWithDetailsAsync(id);
            if (oldPlanning == null)
                return NotFound(new { message = "Événement non trouvé" });

            var planning = await _service.UpdateAsync(id, dto);
            await _hubContext.Clients.All.SendAsync("RefreshSalles");

            return Ok(new { message = "Événement mis à jour avec succès", id = planning.Id });
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

    // ========== DELETE ==========
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var planning = await _service.GetPlanningWithDetailsAsync(id);
            if (planning == null)
                return NotFound(new { message = "Événement non trouvé" });

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

    // ========== ANNULER (direct, sans approbation) ==========
    [HttpPatch("{id}/annuler")]
    public async Task<IActionResult> Annuler(int id, [FromBody] AnnulerPlanningDto dto)
    {
        try
        {
            var planning = await _context.Plannings.FindAsync(id);
            if (planning == null)
                return NotFound(new { message = "Événement non trouvé" });

            // Annuler directement
            planning.Statut = "Annule";
            planning.MotifAnnulation = dto.Motif;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("RefreshSalles");

            return Ok(new { message = "Cours annulé avec succès" });
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("non trouvé"))
                return NotFound(new { message = ex.Message });
            return BadRequest(new { message = ex.Message });
        }
    }

    // ==========================================
    // ========== VÉRIFICATIONS ==========
    // ==========================================

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
}