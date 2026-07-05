using Microsoft.AspNetCore.Mvc;
using back.Services;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursAnnulesController : ControllerBase
    {
        private readonly CoursAnnulesService _service;

        public CoursAnnulesController(CoursAnnulesService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var annules = await _service.GetAllAnnulesAsync();
                return Ok(annules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }
    }
}
