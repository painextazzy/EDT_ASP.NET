using Npgsql;
using back.Dtos;

namespace back.Services
{
    public class CoursAnnuleService
    {
        private readonly string _connectionString;

        public CoursAnnuleService(IConfiguration configuration)
        {
            var host = Environment.GetEnvironmentVariable("DB_HOST");
            var port = Environment.GetEnvironmentVariable("DB_PORT");
            var database = Environment.GetEnvironmentVariable("DB_NAME");
            var username = Environment.GetEnvironmentVariable("DB_USER");
            var password = Environment.GetEnvironmentVariable("DB_PASSWORD");

            _connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password}";
        }

        public async Task<List<CoursAnnuleDto>> GetAllAnnulesAsync()
        {
            var result = new List<CoursAnnuleDto>();

            await using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            const string sql = @"
                SELECT 
                    p.id,
                    m.libelle      AS nom_matiere,
                    m.code         AS code_matiere,
                    p.date_debut,
                    p.date_fin,
                    COALESCE(p.motif_annulation, 'Motif non precise') AS motif_annulation,
                    COALESCE(s.nom_salle, 'Salle non definie')        AS nom_salle,
                    COALESCE(s.batiment, '')                          AS batiment,
                    COALESCE(ens.nom, 'Enseignant non precise')       AS nom_enseignant
                FROM planning p
                INNER JOIN enseignement e   ON e.id = p.id_enseignement
                INNER JOIN matiere m        ON m.id = e.id_matiere
                INNER JOIN enseignant ens   ON ens.id = e.id_enseignant
                LEFT JOIN planning_salle ps ON ps.id_planning = p.id
                LEFT JOIN salle s           ON s.id = ps.id_salle
                WHERE p.statut = 'Annule'
                ORDER BY p.date_debut DESC;
            ";

            await using var cmd = new NpgsqlCommand(sql, connection);
            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                result.Add(new CoursAnnuleDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("id")),
                    NomMatiere = reader.GetString(reader.GetOrdinal("nom_matiere")),
                    CodeMatiere = reader.GetString(reader.GetOrdinal("code_matiere")),
                    DateDebut = reader.GetDateTime(reader.GetOrdinal("date_debut")),
                    DateFin = reader.GetDateTime(reader.GetOrdinal("date_fin")),
                    MotifAnnulation = reader.GetString(reader.GetOrdinal("motif_annulation")),
                    NomSalle = reader.GetString(reader.GetOrdinal("nom_salle")),
                    Batiment = reader.GetString(reader.GetOrdinal("batiment")),
                    NomEnseignant = reader.GetString(reader.GetOrdinal("nom_enseignant")),
                });
            }

            return result;
        }
    }
}