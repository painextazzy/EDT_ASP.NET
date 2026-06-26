// Services/DatabaseBackupService.cs
using back.Data;
using back.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using System.Text;
using System.Text.Json;
using System.Diagnostics;

namespace back.Services
{
    public class BackupConfig
    {
        public bool IncludeEnseignants { get; set; } = true;
        public bool IncludeUtilisateurs { get; set; } = true;
        public bool IncludeCours { get; set; } = true;
        public bool IncludeNiveaux { get; set; } = true;
        public bool IncludeParcours { get; set; } = true;
        public bool IncludeEnseignements { get; set; } = true;
        public bool IncludeSalles { get; set; } = true;
        public bool IncludeDelegues { get; set; } = true;
        public bool IncludePlannings { get; set; } = true;
        public bool IncludePlanningSalles { get; set; } = true;
        public string Format { get; set; } = "json";
        public string? FileName { get; set; }
    }

    public class TableImportResult
    {
        public string TableName { get; set; } = string.Empty;
        public int TotalInJson { get; set; }
        public int ExistingInDb { get; set; }
        public int Inserted { get; set; }
        public string? Error { get; set; }
        public bool Success { get; set; }
        public long ElapsedMs { get; set; }
    }

    public class RestoreResult
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; } = string.Empty;
        public int TablesRestored { get; set; }
        public int TotalRows { get; set; }
        public int InsertedRows { get; set; }
        public int SkippedRows { get; set; }
        public List<TableImportResult> TableResults { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public long TotalElapsedMs { get; set; }
    }

    public interface IDatabaseBackupService
    {
        Task<byte[]> ExportTablesAsync(BackupConfig config);
        Task<byte[]> ExportAllTablesAsync();
        Task<RestoreResult> ImportFromJsonAsync(IFormFile file);
    }

    public class DatabaseBackupService : IDatabaseBackupService
    {
        private readonly string _connectionString;
        private readonly ILogger<DatabaseBackupService> _logger;

        public DatabaseBackupService(IConfiguration configuration, ILogger<DatabaseBackupService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new Exception("Connection string not found");
            _logger = logger;
        }

        public async Task<byte[]> ExportTablesAsync(BackupConfig config)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseNpgsql(_connectionString)
                .Options;

            using var context = new AppDbContext(options);

            var stopwatch = Stopwatch.StartNew();
            try
            {
                var exportData = new Dictionary<string, object>();

                if (config.IncludeNiveaux)
                {
                    var data = await context.Niveaux
                        .Select(n => new { n.Id, n.Libelle })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["niveaux"] = data;
                }

                if (config.IncludeParcours)
                {
                    var data = await context.Parcours
                        .Select(p => new { p.Id, p.Libelle })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["parcours"] = data;
                }

                if (config.IncludeSalles)
                {
                    var data = await context.Salles
                        .Select(s => new { s.Id, s.Numero, s.Batiment, s.Etage, s.Statut, s.CourActuel })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["salles"] = data;
                }

                if (config.IncludeCours)
                {
                    var data = await context.Matieres
                        .Select(m => new { m.Id, m.Code, m.Nom })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["cours"] = data;
                }

                if (config.IncludeUtilisateurs)
                {
                    var data = await context.Utilisateurs
                        .Select(u => new { u.Id, u.Email, u.PasswordHash, u.Role, u.EstValide })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["utilisateurs"] = data;
                }

                if (config.IncludeEnseignants)
                {
                    var data = await context.Enseignants
                        .Select(e => new { e.Id, e.Im, e.Nom, e.PhotoUrl, e.IdUtilisateur })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["enseignants"] = data;
                }

                if (config.IncludeDelegues)
                {
                    var data = await context.Delegues
                        .Select(d => new { d.Id, d.NomDelegue, d.EmailDelegue, d.IdNiveau, d.IdParcours })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["delegues"] = data;
                }

                if (config.IncludeEnseignements)
                {
                    var data = await context.Enseignements
                        .Select(e => new { e.Id, e.IdEnseignant, e.IdMatiere, e.IdNiveau, e.IdParcours, e.EstTermine })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["enseignements"] = data;
                }

                if (config.IncludePlannings)
                {
                    var data = await context.Plannings
                        .Select(p => new { p.Id, p.IdEnseignement, p.TypeEvenement, p.Statut, p.DateDebut, p.DateFin, p.MotifAnnulation })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["plannings"] = data;
                }

                if (config.IncludePlanningSalles)
                {
                    var data = await context.PlanningSalles
                        .Select(ps => new { ps.IdPlanning, ps.IdSalle })
                        .AsNoTracking()
                        .ToListAsync();
                    exportData["planning_salles"] = data;
                }

                exportData["exportDate"] = DateTime.Now;
                exportData["version"] = "2.0.0";

                var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
                {
                    WriteIndented = true,
                    ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles
                });

                return Encoding.UTF8.GetBytes(json);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "❌ Erreur lors de l'export");
                throw new Exception($"Erreur lors de l'export: {ex.Message}");
            }
        }

        public async Task<byte[]> ExportAllTablesAsync()
        {
            var config = new BackupConfig
            {
                IncludeEnseignants = true,
                IncludeUtilisateurs = true,
                IncludeCours = true,
                IncludeNiveaux = true,
                IncludeParcours = true,
                IncludeEnseignements = true,
                IncludeSalles = true,
                IncludeDelegues = true,
                IncludePlannings = true,
                IncludePlanningSalles = true
            };
            return await ExportTablesAsync(config);
        }

        // ========== IMPORT AVEC SQL DIRECT ==========
        public async Task<RestoreResult> ImportFromJsonAsync(IFormFile file)
        {
            var result = new RestoreResult { Success = true };
            var totalStopwatch = Stopwatch.StartNew();

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
                    result.Success = false;
                    result.Message = "Fichier JSON invalide";
                    return result;
                }

                using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                using (var transaction = await connection.BeginTransactionAsync())
                {
                    try
                    {
                        _logger?.LogInformation("🗑️ Suppression des données existantes...");

                        // ✅ 1. VIDER LES TABLES
                        var truncateCommands = new[]
                        {
                            "TRUNCATE TABLE planning_salle CASCADE;",
                            "TRUNCATE TABLE planning CASCADE;",
                            "TRUNCATE TABLE enseignement CASCADE;",
                            "TRUNCATE TABLE delegue CASCADE;",
                            "TRUNCATE TABLE enseignant CASCADE;",
                            "TRUNCATE TABLE utilisateur CASCADE;",
                            "TRUNCATE TABLE matiere CASCADE;",
                            "TRUNCATE TABLE salle CASCADE;",
                            "TRUNCATE TABLE parcours CASCADE;",
                            "TRUNCATE TABLE niveau CASCADE;"
                        };

                        foreach (var cmd in truncateCommands)
                        {
                            using var truncateCmd = new NpgsqlCommand(cmd, connection, transaction);
                            await truncateCmd.ExecuteNonQueryAsync();
                        }

                        int tablesRestored = 0;

                        // ✅ 2. FONCTION D'INSERTION SQL
                        async Task InsertTable(string key, string tableName, string columns, Func<JsonElement, string> getValues)
                        {
                            if (!data.ContainsKey(key) || data[key] == null) return;

                            var jsonElement = (JsonElement)data[key];
                            var items = jsonElement.EnumerateArray().ToList();
                            if (!items.Any()) return;

                            var values = items.Select(getValues);
                            var sql = $"INSERT INTO {tableName} ({columns}) VALUES {string.Join(", ", values)}";

                            using var cmd = new NpgsqlCommand(sql, connection, transaction);
                            await cmd.ExecuteNonQueryAsync();

                            tablesRestored++;
                            _logger?.LogInformation($"📥 {items.Count} {key} importés");
                        }

                        // ✅ 3. IMPORT DES TABLES

                        // Niveaux
                        await InsertTable("niveaux", "niveau", "id, libelle",
                            (item) => $"({item.GetProperty("id").GetInt32()}, '{item.GetProperty("libelle").GetString()?.Replace("'", "''")}')");

                        // Parcours
                        await InsertTable("parcours", "parcours", "id, libelle",
                            (item) => $"({item.GetProperty("id").GetInt32()}, '{item.GetProperty("libelle").GetString()?.Replace("'", "''")}')");

                        // Salles
                        await InsertTable("salles", "salle", "id, nom_salle, batiment, etage, statut, cour_actuel",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var nom = item.GetProperty("numero").GetString()?.Replace("'", "''") ?? "";
                                var batiment = item.GetProperty("batiment").GetString()?.Replace("'", "''") ?? "";
                                var etage = item.GetProperty("etage").GetString()?.Replace("'", "''") ?? "";
                                var statut = item.GetProperty("statut").GetString()?.Replace("'", "''") ?? "LIBRE";
                                var cour = item.TryGetProperty("courActuel", out var c) ? c.GetString()?.Replace("'", "''") : "";
                                return $"({id}, '{nom}', '{batiment}', '{etage}', '{statut}', {(string.IsNullOrEmpty(cour) ? "NULL" : $"'{cour}'")})";
                            });

                        // Cours
                        await InsertTable("cours", "matiere", "id, code, libelle",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var code = item.GetProperty("code").GetString()?.Replace("'", "''") ?? "";
                                var nom = item.GetProperty("nom").GetString()?.Replace("'", "''") ?? "";
                                return $"({id}, '{code}', '{nom}')";
                            });

                        // Utilisateurs
                        await InsertTable("utilisateurs", "utilisateur", "id, email, password_hash, role, est_valide",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var email = item.GetProperty("email").GetString()?.Replace("'", "''") ?? "";
                                var hash = item.GetProperty("passwordHash").GetString()?.Replace("'", "''") ?? "";
                                var role = item.GetProperty("role").GetString()?.Replace("'", "''") ?? "ENSEIGNANT";
                                var estValide = item.GetProperty("estValide").GetBoolean() ? "true" : "false";
                                return $"({id}, '{email}', '{hash}', '{role}', {estValide})";
                            });

                        // Enseignants
                        await InsertTable("enseignants", "enseignant", "id, im, nom, photo_url, id_utilisateur",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var im = item.GetProperty("im").GetString()?.Replace("'", "''") ?? "";
                                var nom = item.GetProperty("nom").GetString()?.Replace("'", "''") ?? "";
                                var photo = item.TryGetProperty("photoUrl", out var p) ? p.GetString()?.Replace("'", "''") ?? "default-avatar.png" : "default-avatar.png";
                                var idUtilisateur = item.TryGetProperty("idUtilisateur", out var u) ? u.GetInt32().ToString() : "NULL";
                                return $"({id}, '{im}', '{nom}', '{photo}', {idUtilisateur})";
                            });

                        // Delegues
                        await InsertTable("delegues", "delegue", "id, nom_delegue, email_delegue, id_niveau, id_parcours",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var nom = item.GetProperty("nomDelegue").GetString()?.Replace("'", "''") ?? "";
                                var email = item.GetProperty("emailDelegue").GetString()?.Replace("'", "''") ?? "";
                                var idNiveau = item.TryGetProperty("idNiveau", out var n) ? n.GetInt32().ToString() : "NULL";
                                var idParcours = item.TryGetProperty("idParcours", out var p) ? p.GetInt32().ToString() : "NULL";
                                return $"({id}, '{nom}', '{email}', {idNiveau}, {idParcours})";
                            });

                        // Enseignements
                        await InsertTable("enseignements", "enseignement", "id, id_enseignant, id_matiere, id_niveau, id_parcours, est_termine",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var idEns = item.GetProperty("idEnseignant").GetInt32();
                                var idMat = item.GetProperty("idMatiere").GetInt32();
                                var idNiv = item.GetProperty("idNiveau").GetInt32();
                                var idPar = item.GetProperty("idParcours").GetInt32();
                                var estTermine = item.TryGetProperty("estTermine", out var t) && t.GetBoolean() ? "true" : "false";
                                return $"({id}, {idEns}, {idMat}, {idNiv}, {idPar}, {estTermine})";
                            });

                        // Plannings
                        await InsertTable("plannings", "planning", "id, id_enseignement, type_evenement, statut, date_debut, date_fin, motif_annulation",
                            (item) =>
                            {
                                var id = item.GetProperty("id").GetInt32();
                                var idEns = item.GetProperty("idEnseignement").GetInt32();
                                var type = item.GetProperty("typeEvenement").GetString()?.Replace("'", "''") ?? "Cours";
                                var statut = item.GetProperty("statut").GetString()?.Replace("'", "''") ?? "Actif";
                                var dateDebut = item.GetProperty("dateDebut").GetString() ?? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                                var dateFin = item.GetProperty("dateFin").GetString() ?? DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                                var motif = item.TryGetProperty("motifAnnulation", out var m) ? m.GetString()?.Replace("'", "''") : "";
                                return $"({id}, {idEns}, '{type}', '{statut}', '{dateDebut}', '{dateFin}', {(string.IsNullOrEmpty(motif) ? "NULL" : $"'{motif}'")})";
                            });

                        // PlanningSalles
                        await InsertTable("planning_salles", "planning_salle", "id_planning, id_salle",
                            (item) =>
                            {
                                var idPlanning = item.GetProperty("idPlanning").GetInt32();
                                var idSalle = item.GetProperty("idSalle").GetInt32();
                                return $"({idPlanning}, {idSalle})";
                            });

                        await transaction.CommitAsync();

                        result.Success = true;
                        result.TablesRestored = tablesRestored;
                        result.Message = $"✅ Données importées avec succès ({tablesRestored} tables)";
                        _logger?.LogInformation($"✅ Import terminé: {tablesRestored} tables restaurées");
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        _logger?.LogError(ex, "❌ Erreur lors de l'import");
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                result.Success = false;
                result.Message = $"❌ Erreur: {ex.Message}";
                result.Errors.Add(ex.Message);
                _logger?.LogError(ex, "❌ Erreur import");
            }

            return result;
        }
    }
}