using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using back.Services;
using back.Hubs;

namespace back.Controllers
{
    [ApiController]
    [Route("api/cours-annule")]
    public class CoursAnnuleController : ControllerBase
    {
        private readonly CoursAnnuleService _service;
        private readonly IHubContext<CoursAnnuleHub> _hub;

        public CoursAnnuleController(CoursAnnuleService service, IHubContext<CoursAnnuleHub> hub)
        {
            _service = service;
            _hub = hub;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var data = await _service.GetAllAnnulesAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erreur: {ex.Message}" });
            }
        }

        [HttpPost("notify")]
        public async Task<IActionResult> NotifyChange()
        {
            await _hub.Clients.All.SendAsync("coursAnnulesUpdated");
            return Ok(new { message = "Notification envoyée" });
        }
    }
}