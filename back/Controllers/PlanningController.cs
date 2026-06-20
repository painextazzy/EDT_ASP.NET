// Controllers/PlanningController.cs
using Microsoft.AspNetCore.Mvc;
using back.Services;
using back.Dtos;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlanningController : ControllerBase
    {
        private readonly PlanningService _service;

        public PlanningController(PlanningService service)
        {
            _service = service;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PlanningDto dto)
        {
            try
            {
                var planning = await _service.CreateAsync(dto);
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
                var planning = await _service.UpdateAsync(id, dto);
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
                await _service.DeleteAsync(id);
                return Ok(new { message = "Événement supprimé avec succès" });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("non trouvé"))
                    return NotFound(new { message = ex.Message });

                return BadRequest(new { message = ex.Message });
            }
        }

        // ✅ VÉRIFICATION PROFESSEUR
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

                var disponible = await _service.IsProfesseurAvailableAsync(professeurId, start, end, excludeId);

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

        // ✅ VÉRIFICATION SALLE - par nom
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

                var disponible = await _service.IsSalleAvailableAsync(salle.Id, start, end, excludeId);

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

        // ✅ VÉRIFICATION SALLE - par ID
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

                var disponible = await _service.IsSalleAvailableAsync(salleId, start, end, excludeId);

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