// Models/Enseignant.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models
{
    [Table("enseignant")]
    public class Enseignant
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("im")]
        public string Im { get; set; } = string.Empty;

        [Column("nom")]
        public string Nom { get; set; } = string.Empty;

        [Column("photo_url")]
        public string PhotoUrl { get; set; } = string.Empty;

        [Column("id_utilisateur")]
        public int? IdUtilisateur { get; set; }

        [ForeignKey("IdUtilisateur")]
        public virtual Utilisateur? Utilisateur { get; set; }
    }
}