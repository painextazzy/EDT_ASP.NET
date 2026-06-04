using back.DTos;
using back.Models;
using back.Services;
using Microsoft.AspNetCore.Mvc;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalleController : ControllerBase
{
    private readonly SalleService _salleService;

    public SalleController(SalleService salleService)
    {
        _salleService = salleService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? batiment, [FromQuery] int? etage, [FromQuery] string? search)
    {
        var salles = await _salleService.GetAllSalles(batiment, etage, search);
        return Ok(salles);
    }

    [HttpGet("batiments")]
    public async Task<IActionResult> GetBatiments()
    {
        return Ok(await _salleService.GetUniqueBatiments());
    }

    [HttpGet("etages")]
    public async Task<IActionResult> GetEtages()
    {
        return Ok(await _salleService.GetUniqueEtages());
    }

    [HttpPost]
    public async Task<IActionResult> Create(SalleDto salleDto)
    {
        var created = await _salleService.CreateSalle(salleDto);
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SalleDto salleDto)
    {
        var success = await _salleService.UpdateSalle(id, salleDto);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _salleService.DeleteSalle(id);
        if (!success) return NotFound();
        return NoContent();
    }
}