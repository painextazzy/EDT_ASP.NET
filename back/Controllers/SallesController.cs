using GestionSalles.API.DTOs;
using GestionSalles.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace GestionSalles.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class SallesController : ControllerBase
{
    private readonly ISalleService _service;
    private readonly ILogger<SallesController> _logger;

    public SallesController(ISalleService service, ILogger<SallesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Récupère toutes les salles avec filtres optionnels.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SalleDto>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? batiment,
        [FromQuery] int? etage,
        [FromQuery] string? search)
    {
        var salles = await _service.GetAllAsync(batiment, etage, search);
        return Ok(salles);
    }

    /// <summary>
    /// Récupère une salle par son ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(SalleDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        if (id <= 0)
            return BadRequest(new { message = "L'identifiant doit être un entier positif." });

        var salle = await _service.GetByIdAsync(id);
        if (salle == null)
            return NotFound(new { message = $"Aucune salle trouvée avec l'identifiant {id}." });

        return Ok(salle);
    }

    /// <summary>
    /// Retourne la liste distincte des bâtiments (pour alimenter le filtre).
    /// </summary>
    [HttpGet("batiments")]
    [ProducesResponseType(typeof(IEnumerable<string>), 200)]
    public async Task<IActionResult> GetBatiments()
    {
        var batiments = await _service.GetBatimentsAsync();
        return Ok(batiments);
    }

    /// <summary>
    /// Retourne la liste distincte des étages (pour alimenter le filtre).
    /// </summary>
    [HttpGet("etages")]
    [ProducesResponseType(typeof(IEnumerable<int>), 200)]
    public async Task<IActionResult> GetEtages()
    {
        var etages = await _service.GetEtagesAsync();
        return Ok(etages);
    }

    /// <summary>
    /// Crée une nouvelle salle.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(SalleDto), 201)]
    [ProducesResponseType(400)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Create([FromBody] CreateSalleDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { message = "Données invalides.", errors });
        }

        // Vérifier la duplication
        if (await _service.ExistsAsync(dto.NomSalle, dto.Batiment))
        {
            return Conflict(new
            {
                message = $"La salle « {dto.NomSalle} » existe déjà dans « {dto.Batiment} ». " +
                           "Veuillez choisir un numéro différent ou un autre bâtiment."
            });
        }

        var created = await _service.CreateAsync(dto);
        _logger.LogInformation("Salle créée : {NomSalle} dans {Batiment} (ID: {Id})",
            created.NomSalle, created.Batiment, created.Id);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    /// <summary>
    /// Met à jour partiellement une salle existante (PATCH).
    /// </summary>
    [HttpPatch("{id:int}")]
    [ProducesResponseType(typeof(SalleDto), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    [ProducesResponseType(409)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSalleDto dto)
    {
        if (id <= 0)
            return BadRequest(new { message = "L'identifiant doit être un entier positif." });

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { message = "Données invalides.", errors });
        }

        // Vérifier l'existence avant modification
        var existing = await _service.GetByIdAsync(id);
        if (existing == null)
            return NotFound(new { message = $"Aucune salle trouvée avec l'identifiant {id}." });

        // Vérifier la duplication si le nom ou bâtiment change
        var newNom = dto.NomSalle ?? existing.NomSalle;
        var newBat = dto.Batiment ?? existing.Batiment;

        if (await _service.ExistsAsync(newNom, newBat, excludeId: id))
        {
            return Conflict(new
            {
                message = $"La salle « {newNom} » existe déjà dans « {newBat} »."
            });
        }

        var updated = await _service.UpdateAsync(id, dto);
        _logger.LogInformation("Salle mise à jour : ID {Id}", id);
        return Ok(updated);
    }

    /// <summary>
    /// Supprime une salle par son ID.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        if (id <= 0)
            return BadRequest(new { message = "L'identifiant doit être un entier positif." });

        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return NotFound(new { message = $"Impossible de supprimer : aucune salle avec l'identifiant {id}." });

        _logger.LogInformation("Salle supprimée : ID {Id}", id);
        return NoContent();
    }
}