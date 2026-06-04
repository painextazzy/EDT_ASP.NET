using Microsoft.AspNetCore.Mvc;
using back.Models;
using back.Services;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalleController : ControllerBase
    {
        private readonly SalleService _salleService;

        public SalleController(SalleService salleService)
        {
            _salleService = salleService;
        }

        // Controllers/SalleController.cs
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? batiment, [FromQuery] string? etage, [FromQuery] string? search)
        {
            try
            {
                var salles = await _salleService.GetAllSalles(batiment, etage, search);
                return Ok(salles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpGet("batiments")]
        public async Task<IActionResult> GetBatiments()
        {
            try
            {
                var batiments = await _salleService.GetBatiments();
                return Ok(batiments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Salle salle)
        {
            try
            {
                if (string.IsNullOrEmpty(salle.Numero) || string.IsNullOrEmpty(salle.Batiment))
                {
                    return BadRequest(new { message = "Le numéro et le bâtiment sont requis" });
                }

                var newSalle = await _salleService.CreateSalle(salle);
                return Ok(newSalle);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Salle salle)
        {
            try
            {
                var updated = await _salleService.UpdateSalle(id, salle);
                if (updated == null)
                    return NotFound(new { message = "Salle non trouvée" });

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted = await _salleService.DeleteSalle(id);
                if (!deleted)
                    return NotFound(new { message = "Salle non trouvée" });

                return Ok(new { message = "Salle supprimée" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}