using Microsoft.AspNetCore.Mvc;
using back.Dtos;
using back.Services;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InscriptionController : ControllerBase
{
    private readonly InscriptionService _inscriptionService;

    public InscriptionController(InscriptionService inscriptionService)
    {
        _inscriptionService = inscriptionService;
    }

    [HttpPost("professeur")]
    public async Task<IActionResult> InscrireProfesseur([FromBody] InscriptionProfesseurDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new { success = false, message = string.Join(", ", errors) });
        }

        var result = await _inscriptionService.InscrireProfesseur(dto);

        if (!result.Success)
        {
            return BadRequest(new { success = false, message = result.Message });
        }

        return Ok(new { success = true, message = result.Message, enseignantId = result.EnseignantId });
    }

    [HttpPost("valider/{id}")]
    public async Task<IActionResult> ValiderEnseignant(int id)
    {
        var success = await _inscriptionService.ValiderEnseignant(id);

        if (!success)
            return NotFound(new { success = false, message = "Enseignant non trouvé" });

        return Ok(new { success = true, message = "Enseignant validé avec succès" });
    }
}