using Microsoft.AspNetCore.Mvc;
using back.Dtos;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DelegueController : ControllerBase
{
    private readonly DelegueService _service;

    public DelegueController(DelegueService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var delegues = await _service.GetAllAsync();
        return Ok(delegues);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDelegueDto dto)
    {
        try
        {
            var message = await _service.CreateAsync(dto);
            return Ok(new { message });
        }
        catch (InvalidOperationException ex)
        {
            // Vérifier si l'erreur concerne un email dupliqué
            if (ex.Message.Contains("email") || ex.Message.Contains("Email"))
            {
                return Conflict(new { message = "Cet email est déjà utilisé par un autre délégué" });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateDelegueDto dto)
    {
        try
        {
            var message = await _service.UpdateAsync(id, dto);
            return Ok(new { message });
        }
        catch (InvalidOperationException ex)
        {
            // Vérifier si l'erreur concerne un email dupliqué
            if (ex.Message.Contains("email") || ex.Message.Contains("Email"))
            {
                return Conflict(new { message = "Cet email est déjà utilisé par un autre délégué" });
            }
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return Ok(new { message = "Délégué supprimé avec succès" });
    }
}