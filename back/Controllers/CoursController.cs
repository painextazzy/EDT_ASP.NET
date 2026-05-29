using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Dtos;
using back.Models;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public CoursController(AppDbContext context)
    {
        _context = context;
    }
    
    // GET: api/cours
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cours = await _context.Matieres
            .Select(c => new CoursDto
            {
                Id = c.Id,
                Code = c.Code,
                Nom = c.Nom
            })
            .ToListAsync();
        return Ok(cours);
    }
    
    // GET: api/cours/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var cours = await _context.Matieres.FindAsync(id);
        if (cours == null)
            return NotFound(new { message = "Cours non trouvé" });
        
        return Ok(new CoursDto
        {
            Id = cours.Id,
            Code = cours.Code,
            Nom = cours.Nom
        });
    }
    
    // POST: api/cours
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCoursDto dto)
    {
        if (string.IsNullOrEmpty(dto.Code) || string.IsNullOrEmpty(dto.Nom))
            return BadRequest(new { message = "Code et nom du cours requis" });
        
        var existingCours = await _context.Matieres
            .FirstOrDefaultAsync(c => c.Code == dto.Code);
        
        if (existingCours != null)
            return BadRequest(new { message = "Un cours avec ce code existe déjà" });
        
        var cours = new Cours
        {
            Code = dto.Code,
            Nom = dto.Nom
        };
        
        _context.Matieres.Add(cours);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Cours ajouté avec succès", cours = new { cours.Id, cours.Code, cours.Nom } });
    }
    
    // PUT: api/cours/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCoursDto dto)
    {
        var cours = await _context.Matieres.FindAsync(id);
        if (cours == null)
            return NotFound(new { message = "Cours non trouvé" });
        
        if (!string.IsNullOrEmpty(dto.Code))
            cours.Code = dto.Code;
        
        if (!string.IsNullOrEmpty(dto.Nom))
            cours.Nom = dto.Nom;
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "Cours modifié avec succès", cours = new { cours.Id, cours.Code, cours.Nom } });
    }
    
    // DELETE: api/cours/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var cours = await _context.Matieres.FindAsync(id);
        if (cours == null)
            return NotFound(new { message = "Cours non trouvé" });
        
        // Vérifier si le cours est utilisé dans des enseignements
        var isUsed = await _context.Enseignements.AnyAsync(e => e.IdMatiere == id);
        if (isUsed)
            return BadRequest(new { message = "Ce cours est utilisé dans des affectations et ne peut pas être supprimé" });
        
        _context.Matieres.Remove(cours);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Cours supprimé avec succès" });
    }
}