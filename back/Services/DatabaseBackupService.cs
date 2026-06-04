// Services/DatabaseBackupService.cs
using back.Data;
using back.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;

namespace back.Services
{
    // Modèles
    public class BackupConfig
    {
        public bool IncludeEnseignants { get; set; } = true;
        public bool IncludeUtilisateurs { get; set; } = true;
        public bool IncludeCours { get; set; } = true;
        public bool IncludeNiveaux { get; set; } = true;
        public bool IncludeParcours { get; set; } = true;
        public bool IncludeEnseignements { get; set; } = true;
        public string Format { get; set; } = "json";
        public string? FileName { get; set; } // Nullable
    }

    public class RestoreResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty; // Initialisé
        public int TablesRestored { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    public interface IDatabaseBackupService
    {
        Task<byte[]> ExportTablesAsync(BackupConfig config);
        Task<RestoreResult> ImportFromJsonAsync(IFormFile file);
    }

    public class DatabaseBackupService : IDatabaseBackupService
    {
        private readonly AppDbContext _context;

        public DatabaseBackupService(AppDbContext context)
        {
            _context = context;
        }

        // Export direct en mémoire (téléchargement)
        public async Task<byte[]> ExportTablesAsync(BackupConfig config)
        {
            try
            {
                var exportData = new Dictionary<string, object>();

                // Enseignants
                if (config.IncludeEnseignants)
                {
                    var enseignants = await _context.Enseignants
                        .Include(e => e.Utilisateur)
                        .ToListAsync();
                    exportData["enseignants"] = enseignants;
                }

                // Utilisateurs
                if (config.IncludeUtilisateurs)
                {
                    var utilisateurs = await _context.Utilisateurs.ToListAsync();
                    exportData["utilisateurs"] = utilisateurs;
                }

                // Cours (Matières)
                if (config.IncludeCours)
                {
                    var cours = await _context.Matieres.ToListAsync();
                    exportData["cours"] = cours;
                }

                // Niveaux
                if (config.IncludeNiveaux)
                {
                    var niveaux = await _context.Niveaux.ToListAsync();
                    exportData["niveaux"] = niveaux;
                }

                // Parcours
                if (config.IncludeParcours)
                {
                    var parcours = await _context.Parcours.ToListAsync();
                    exportData["parcours"] = parcours;
                }

                // Enseignements
                if (config.IncludeEnseignements)
                {
                    var enseignements = await _context.Enseignements
                        .Include(e => e.Enseignant)
                        .Include(e => e.Cours)
                        .Include(e => e.Niveau)
                        .Include(e => e.Parcours)
                        .ToListAsync();
                    exportData["enseignements"] = enseignements;
                }

                exportData["exportDate"] = DateTime.Now;
                exportData["version"] = "1.0.0";

                var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                });

                return Encoding.UTF8.GetBytes(json);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de l'export: {ex.Message}");
            }
        }

        // Import depuis fichier JSON uploadé
        public async Task<RestoreResult> ImportFromJsonAsync(IFormFile file)
        {
            var result = new RestoreResult { Success = false, Errors = new List<string>() };

            try
            {
                string jsonContent;
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    jsonContent = await reader.ReadToEndAsync();
                }

                var data = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonContent);

                if (data == null)
                {
                    result.Message = "Fichier JSON invalide";
                    return result;
                }

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // Nettoyer les tables dans l'ordre (respect des clés étrangères)
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

                        // Helper pour importer avec vérification null
                        async Task ImportTable<T>(string key) where T : class
                        {
                            if (data.ContainsKey(key) && data[key] != null)
                            {
                                var json = data[key]?.ToString();
                                if (!string.IsNullOrEmpty(json))
                                {
                                    var items = JsonSerializer.Deserialize<List<T>>(json);
                                    if (items != null && items.Any())
                                    {
                                        await _context.Set<T>().AddRangeAsync(items);
                                        tablesRestored++;
                                    }
                                }
                            }
                        }

                        // Importer dans l'ordre des dépendances
                        await ImportTable<Parcours>("parcours");
                        await ImportTable<Niveau>("niveaux");
                        await ImportTable<Cours>("cours");
                        await ImportTable<Utilisateur>("utilisateurs");
                        await ImportTable<Enseignant>("enseignants");
                        await ImportTable<Enseignement>("enseignements");

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();

                        result.Success = true;
                        result.Message = $"Données importées avec succès ({tablesRestored} tables)";
                        result.TablesRestored = tablesRestored;
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        throw new Exception($"Erreur lors de l'import: {ex.Message}");
                    }
                }
            }
            catch (Exception ex)
            {
                result.Message = $"Erreur lors de l'import: {ex.Message}";
                result.Errors.Add(ex.Message);
            }

            return result;
        }
    }
}