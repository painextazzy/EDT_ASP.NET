using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back.Data;
using back.Models;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlanningController : ControllerBase
{
    private readonly AppDbContext _context;
    
    public PlanningController(AppDbContext context)
    {
        _context = context;
    }
    
    // GET: api/planning
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var plannings = await _context.Plannings
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Cours)
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Enseignant)
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Niveau)
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Parcours)
            .ToListAsync();
        
        var result = plannings.Select(p => new
        {
            p.Id,
            p.IdEnseignement,
            p.TypeEvenement,
            p.Statut,
            p.DateDebut,
            p.DateFin,
            p.MotifAnnulation,
            titre = p.Enseignement?.Cours?.Nom ?? "Cours",
            matiere = p.Enseignement?.Cours != null ? new
            {
                p.Enseignement.Cours.Id,
                p.Enseignement.Cours.Code,
                p.Enseignement.Cours.Nom
            } : null,
            enseignant = p.Enseignement?.Enseignant != null ? new
            {
                p.Enseignement.Enseignant.Id,
                p.Enseignement.Enseignant.Nom,
                p.Enseignement.Enseignant.PhotoUrl
            } : null,
            niveau = p.Enseignement?.Niveau?.Libelle,
            parcours = p.Enseignement?.Parcours?.Libelle
        });
        
        return Ok(result);
    }
    
    // GET: api/planning/range?start=...&end=...
    [HttpGet("range")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime start, [FromQuery] DateTime end)
    {
        var plannings = await _context.Plannings
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Cours)
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Enseignant)
            .Where(p => p.DateDebut >= start && p.DateFin <= end)
            .ToListAsync();
        
        return Ok(plannings);
    }
    
    // GET: api/planning/enseignement/{id}
    [HttpGet("enseignement/{id}")]
    public async Task<IActionResult> GetByEnseignement(int id)
    {
        var plannings = await _context.Plannings
            .Include(p => p.Enseignement)
                .ThenInclude(e => e.Cours)
            .Where(p => p.IdEnseignement == id)
            .ToListAsync();
        
        return Ok(plannings);
    }
    
    // POST: api/planning
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Planning planning)
    {
        if (planning.IdEnseignement <= 0)
            return BadRequest(new { message = "Enseignement requis" });
        
        planning.Statut = "Actif";
        _context.Plannings.Add(planning);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Événement créé avec succès", id = planning.Id });
    }
    
    // PUT: api/planning/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Planning planning)
    {
        var existing = await _context.Plannings.FindAsync(id);
        if (existing == null)
            return NotFound(new { message = "Événement non trouvé" });
        
        existing.TypeEvenement = planning.TypeEvenement;
        existing.DateDebut = planning.DateDebut;
        existing.DateFin = planning.DateFin;
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "Événement modifié avec succès" });
    }
    
    // PATCH: api/planning/{id}/annuler
    [HttpPatch("{id}/annuler")]
    public async Task<IActionResult> Annuler(int id, [FromBody] string motif)
    {
        var planning = await _context.Plannings.FindAsync(id);
        if (planning == null)
            return NotFound(new { message = "Événement non trouvé" });
        
        planning.Statut = "Annule";
        planning.MotifAnnulation = motif;
        
        await _context.SaveChangesAsync();
        return Ok(new { message = "Cours annulé avec succès" });
    }
    
    // DELETE: api/planning/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var planning = await _context.Plannings.FindAsync(id);
        if (planning == null)
            return NotFound(new { message = "Événement non trouvé" });
        
        _context.Plannings.Remove(planning);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Événement supprimé avec succès" });
    }
}