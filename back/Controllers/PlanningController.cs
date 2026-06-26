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

    // ========== ANNULER ==========
    [HttpPatch("{id}/annuler")]
    public async Task<IActionResult> Annuler(int id, [FromBody] AnnulerPlanningDto dto)
    {
        try
        {
            var planning = await _service.GetPlanningWithDetailsAsync(id);
            if (planning == null)
                return NotFound(new { message = "Événement non trouvé" });

            await _service.AnnulerAsync(id, dto.Motif);
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

    // ==========================================
    // ========== DEMANDE D'ANNULATION ==========
    // ==========================================

    // POST: api/planning/{id}/demander-annulation
    [HttpPost("{id}/demander-annulation")]
    public async Task<IActionResult> DemanderAnnulation(int id, [FromBody] DemandeAnnulationDto dto)
    {
        try
        {
            var planning = await _context.Plannings
                .Include(p => p.Enseignement)
                    .ThenInclude(e => e.Enseignant)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (planning == null)
                return NotFound(new { message = "Cours non trouvé" });

            if (planning.Statut == "Annule")
                return BadRequest(new { message = "Ce cours est déjà annulé" });

            var enseignantId = planning.Enseignement?.IdEnseignant;
            if (enseignantId == null)
                return BadRequest(new { message = "Enseignant non associé à ce cours" });

            // Créer la demande d'annulation
            var request = new AnnulationRequest
            {
                IdPlanning = id,
                IdEnseignant = enseignantId.Value,
                Motif = dto.Motif,
                Statut = "EN_ATTENTE",
                DateDemande = DateTime.UtcNow
            };

            _context.AnnulationRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Demande d'annulation envoyée avec succès", 
                requestId = request.Id 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
        }
    }

    // GET: api/planning/demandes-annulation (ADMIN)
    [HttpGet("demandes-annulation")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetDemandesAnnulation()
    {
        try
        {
            var demandes = await _context.AnnulationRequests
                .Include(r => r.Planning)
                    .ThenInclude(p => p.Enseignement)
                        .ThenInclude(e => e.Cours)
                .Include(r => r.Planning)
                    .ThenInclude(p => p.Enseignement)
                        .ThenInclude(e => e.Enseignant)
                .Include(r => r.Enseignant)
                .Where(r => r.Statut == "EN_ATTENTE")
                .OrderBy(r => r.DateDemande)
                .ToListAsync();

            var result = demandes.Select(r => new
            {
                r.Id,
                r.Motif,
                r.DateDemande,
                r.Statut,
                planning = new
                {
                    r.Planning.Id,
                    r.Planning.DateDebut,
                    r.Planning.DateFin,
                    cours = r.Planning.Enseignement?.Cours?.Nom,
                    enseignant = r.Planning.Enseignement?.Enseignant?.Nom
                },
                enseignant = new
                {
                    r.Enseignant.Id,
                    r.Enseignant.Nom
                }
            });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
        }
    }

    // PATCH: api/planning/demandes-annulation/{requestId}/approuver (ADMIN)
    [HttpPatch("demandes-annulation/{requestId}/approuver")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> ApprouverAnnulation(int requestId, [FromBody] TraiterAnnulationDto dto)
    {
        try
        {
            var request = await _context.AnnulationRequests
                .Include(r => r.Planning)
                .FirstOrDefaultAsync(r => r.Id == requestId);

            if (request == null)
                return NotFound(new { message = "Demande non trouvée" });

            if (request.Statut != "EN_ATTENTE")
                return BadRequest(new { message = "Cette demande a déjà été traitée" });

            request.Statut = "APPROUVE";
            request.DateTraitement = DateTime.UtcNow;
            request.CommentaireAdmin = dto.Commentaire;

            // Annuler le cours
            var planning = request.Planning;
            planning.Statut = "Annule";
            planning.MotifAnnulation = request.Motif;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Demande d'annulation approuvée avec succès" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
        }
    }

    // PATCH: api/planning/demandes-annulation/{requestId}/refuser (ADMIN)
    [HttpPatch("demandes-annulation/{requestId}/refuser")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> RefuserAnnulation(int requestId, [FromBody] TraiterAnnulationDto dto)
    {
        try
        {
            var request = await _context.AnnulationRequests.FindAsync(requestId);

            if (request == null)
                return NotFound(new { message = "Demande non trouvée" });

            if (request.Statut != "EN_ATTENTE")
                return BadRequest(new { message = "Cette demande a déjà été traitée" });

            request.Statut = "REFUSE";
            request.DateTraitement = DateTime.UtcNow;
            request.CommentaireAdmin = dto.Commentaire;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Demande d'annulation refusée" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
        }
    }
}