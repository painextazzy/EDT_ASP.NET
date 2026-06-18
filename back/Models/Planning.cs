// Models/Planning.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("planning")]
public class Planning
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("id_enseignement")]
    public int IdEnseignement { get; set; }

    [Column("type_evenement")]
    public string TypeEvenement { get; set; } = "Cours";

    [Column("statut")]
    public string Statut { get; set; } = "Actif";

    [Column("date_debut")]
    public DateTime DateDebut { get; set; }

    [Column("date_fin")]
    public DateTime DateFin { get; set; }

    [Column("motif_annulation")]
    public string? MotifAnnulation { get; set; }

    // Navigation properties
    [ForeignKey("IdEnseignement")]
    public virtual Enseignement Enseignement { get; set; } = null!;

    // Collection des salles associées à ce planning
    public virtual ICollection<PlanningSalle> PlanningSalles { get; set; } = new List<PlanningSalle>();
}