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

                // ✅ Cours (modèle Cours, table matiere)
                var cours = await _context.Matieres.ToListAsync();  // DbSet<Cours>
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
                    .Include(e => e.Cours)  // ✅ Navigation property Cours
                    .Include(e => e.Niveau)
                    .Include(e => e.Parcours)
                    .ToListAsync();
                exportData["enseignements"] = enseignements;

                // Salles
                var salles = await _context.Salles.ToListAsync();
                exportData["salles"] = salles;

                // Délégués
                var delegues = await _context.Delegues
                    .Include(d => d.Niveau)
                    .Include(d => d.Parcours)
                    .ToListAsync();
                exportData["delegues"] = delegues;

                // Plannings
                var plannings = await _context.Plannings
                    .Include(p => p.Enseignement)
                    .ToListAsync();
                exportData["plannings"] = plannings;

                // Planning_Salle
                var planningSalles = await _context.PlanningSalles
                    .Include(ps => ps.Planning)
                    .Include(ps => ps.Salle)
                    .ToListAsync();
                exportData["planning_salles"] = planningSalles;

                exportData["exportDate"] = DateTime.Now;
                exportData["version"] = "2.0.0";

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
                        // Nettoyer les tables (ordre inverse des dépendances)
                        if (data.ContainsKey("planning_salles"))
                            _context.PlanningSalles.RemoveRange(_context.PlanningSalles);

                        if (data.ContainsKey("plannings"))
                            _context.Plannings.RemoveRange(_context.Plannings);

                        if (data.ContainsKey("enseignements"))
                            _context.Enseignements.RemoveRange(_context.Enseignements);

                        if (data.ContainsKey("delegues"))
                            _context.Delegues.RemoveRange(_context.Delegues);

                        if (data.ContainsKey("enseignants"))
                            _context.Enseignants.RemoveRange(_context.Enseignants);

                        if (data.ContainsKey("utilisateurs"))
                            _context.Utilisateurs.RemoveRange(_context.Utilisateurs);

                        // ✅ Nettoyer la table matiere (DbSet<Cours>)
                        if (data.ContainsKey("cours"))
                            _context.Matieres.RemoveRange(_context.Matieres);  // Matieres = DbSet<Cours>

                        if (data.ContainsKey("salles"))
                            _context.Salles.RemoveRange(_context.Salles);

                        if (data.ContainsKey("parcours"))
                            _context.Parcours.RemoveRange(_context.Parcours);

                        if (data.ContainsKey("niveaux"))
                            _context.Niveaux.RemoveRange(_context.Niveaux);

                        await _context.SaveChangesAsync();

                        int tablesRestored = 0;

                        // Fonction d'import générique
                        async Task ImportTable<T>(string key) where T : class
                        {
                            if (data.ContainsKey(key) && data[key] != null)
                            {
                                var jsonElement = (JsonElement)data[key];
                                var items = JsonSerializer.Deserialize<List<T>>(jsonElement.GetRawText());
                                if (items != null && items.Any())
                                {
                                    await _context.Set<T>().AddRangeAsync(items);
                                    tablesRestored++;
                                }
                            }
                        }

                        // ✅ Importer avec le bon modèle
                        await ImportTable<Niveau>("niveaux");
                        await ImportTable<Parcours>("parcours");
                        await ImportTable<Salle>("salles");
                        await ImportTable<Cours>("cours");  // ✅ Modèle Cours
                        await ImportTable<Utilisateur>("utilisateurs");
                        await ImportTable<Enseignant>("enseignants");
                        await ImportTable<Delegue>("delegues");
                        await ImportTable<Enseignement>("enseignements");
                        await ImportTable<Planning>("plannings");
                        await ImportTable<PlanningSalle>("planning_salles");

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        return Ok(new
                        {
                            success = true,
                            message = "Import réussi",
                            tablesRestored = tablesRestored
                        });
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