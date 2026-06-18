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
                return Conflict(new { message = ex.Message });
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
                return Conflict(new { message = ex.Message });
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
                return NotFound(new { message = ex.Message });
            }
        }
        // [HttpGet("check-professeur")]
        [HttpGet("check-professeur")]
        public async Task<IActionResult> CheckProfesseur(
            [FromQuery] int professeurId,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] int? excludeId = null)
        {
            try
            {
                // TODO: Implémente la logique dans ton PlanningService
                // Exemple fictif :
                // bool disponible = await _service.CheckProfesseurDisponibiliteAsync(professeurId, start, end, excludeId);

                bool disponible = true; // À remplacer par ton appel de service
                return Ok(new { disponible = disponible });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la vérification : {ex.Message}" });
            }
        }

        // [HttpGet("check-salle")]
        [HttpGet("check-salle")]
        public async Task<IActionResult> CheckSalle(
            [FromQuery] string salleNom,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] int? excludeId = null)
        {
            try
            {
                // TODO: Implémente la logique dans ton PlanningService
                // Exemple fictif :
                // bool disponible = await _service.CheckSalleDisponibiliteAsync(salleNom, start, end, excludeId);

                bool disponible = true; // À remplacer par ton appel de service
                return Ok(new { disponible = disponible });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la vérification : {ex.Message}" });
            }
        }

        // [HttpGet("check-salle-by-id")]
        [HttpGet("check-salle-by-id")]
        public async Task<IActionResult> CheckSalleById(
            [FromQuery] int salleId,
            [FromQuery] DateTime start,
            [FromQuery] DateTime end,
            [FromQuery] int? excludeId = null)
        {
            try
            {
                // TODO: Implémente la logique dans ton PlanningService
                bool disponible = true;
                return Ok(new { disponible = disponible });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur lors de la vérification : {ex.Message}" });
            }
        }
    }

}