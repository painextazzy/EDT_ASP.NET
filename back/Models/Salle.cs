// Models/Salle.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models
{
    [Table("salle")]
    public class Salle
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nom_salle")]
        public string Numero { get; set; } = string.Empty;

        [Column("batiment")]
        public string Batiment { get; set; } = string.Empty;

        [Column("etage")]
        public string Etage { get; set; } = string.Empty;

        [Column("statut")]
        public string Statut { get; set; } = "LIBRE";

        [Column("cour_actuel")]
        public string? CourActuel { get; set; }
    }
}