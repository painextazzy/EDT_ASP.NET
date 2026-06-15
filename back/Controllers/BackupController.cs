// Controllers/BackupController.cs
using Microsoft.AspNetCore.Mvc;
using back.Data;
using back.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BackupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BackupController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("export")]
        public async Task<IActionResult> Export()
        {
            try
            {
                var exportData = new Dictionary<string, object>();

                // Enseignants
                var enseignants = await _context.Enseignants
                    .Include(e => e.Utilisateur)
                    .ToListAsync();
                exportData["enseignants"] = enseignants;

                // Utilisateurs
                var utilisateurs = await _context.Utilisateurs.ToListAsync();
                exportData["utilisateurs"] = utilisateurs;

                // Cours (Matières)
                var cours = await _context.Matieres.ToListAsync();
                exportData["cours"] = cours;

                // Niveaux
                var niveaux = await _context.Niveaux.ToListAsync();
                exportData["niveaux"] = niveaux;

                // Parcours
                var parcours = await _context.Parcours.ToListAsync();
                exportData["parcours"] = parcours;

                // Enseignements
                var enseignements = await _context.Enseignements
                    .Include(e => e.Enseignant)
                    .Include(e => e.Cours)
                    .Include(e => e.Niveau)
                    .Include(e => e.Parcours)
                    .ToListAsync();
                exportData["enseignements"] = enseignements;

                exportData["exportDate"] = DateTime.Now;
                exportData["version"] = "1.0.0";

                var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                });

                var fileBytes = Encoding.UTF8.GetBytes(json);
                var fileName = $"backup_{DateTime.Now:yyyyMMdd_HHmmss}.json";

                return File(fileBytes, "application/json", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> Import(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "Aucun fichier fourni" });

                if (!file.FileName.EndsWith(".json"))
                    return BadRequest(new { message = "Format non supporté. Utilisez .json" });

                string jsonContent;
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    jsonContent = await reader.ReadToEndAsync();
                }

                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonContent);

                if (data == null)
                    return BadRequest(new { message = "Fichier JSON invalide" });

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Nettoyer les tables
                        if (data.ContainsKey("enseignements"))
                            _context.Enseignements.RemoveRange(_context.Enseignements);

                        if (data.ContainsKey("enseignants"))
                            _context.Enseignants.RemoveRange(_context.Enseignants);

                        if (data.ContainsKey("utilisateurs"))
                            _context.Utilisateurs.RemoveRange(_context.Utilisateurs);

                        if (data.ContainsKey("cours"))
                            _context.Matieres.RemoveRange(_context.Matieres);

                        if (data.ContainsKey("niveaux"))
                            _context.Niveaux.RemoveRange(_context.Niveaux);

                        if (data.ContainsKey("parcours"))
                            _context.Parcours.RemoveRange(_context.Parcours);

                        await _context.SaveChangesAsync();

                        int tablesRestored = 0;

                        // Importer
                        if (data.ContainsKey("parcours") && data["parcours"] != null)
                        {
                            var items = JsonSerializer.Deserialize<List<Parcours>>(data["parcours"].ToString());
                            if (items != null && items.Any())
                            {
                                await _context.Parcours.AddRangeAsync(items);
                                tablesRestored++;
                            }
                        }

                        if (data.ContainsKey("niveaux") && data["niveaux"] != null)
                        {
                            var items = JsonSerializer.Deserialize<List<Niveau>>(data["niveaux"].ToString());
                            if (items != null && items.Any())
                            {
                                await _context.Niveaux.AddRangeAsync(items);
                                tablesRestored++;
                            }
                        }

                        if (data.ContainsKey("cours") && data["cours"] != null)
                        {
                            var items = JsonSerializer.Deserialize<List<Cours>>(data["cours"].ToString());
                            if (items != null && items.Any())
                            {
                                await _context.Matieres.AddRangeAsync(items);
                                tablesRestored++;
                            }
                        }

                        if (data.ContainsKey("utilisateurs") && data["utilisateurs"] != null)
                        {
                            var items = JsonSerializer.Deserialize<List<Utilisateur>>(data["utilisateurs"].ToString());
                            if (items != null && items.Any())
                            {
                                await _context.Utilisateurs.AddRangeAsync(items);
                                tablesRestored++;
                            }
                        }

                        if (data.ContainsKey("enseignants") && data["enseignants"] != null)
                        {
                            var items = JsonSerializer.Deserialize<List<Enseignant>>(data["enseignants"].ToString());
                            if (items != null && items.Any())
                            {
                                await _context.Enseignants.AddRangeAsync(items);
                                tablesRestored++;
                            }
                        }

                        if (data.ContainsKey("enseignements") && data["enseignements"] != null)
                        {
                            var items = JsonSerializer.Deserialize<List<Enseignement>>(data["enseignements"].ToString());
                            if (items != null && items.Any())
                            {
                                await _context.Enseignements.AddRangeAsync(items);
                                tablesRestored++;
                            }
                        }

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return Ok(new { success = true, message = "Import réussi", tablesRestored = tablesRestored });
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        throw ex;
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}