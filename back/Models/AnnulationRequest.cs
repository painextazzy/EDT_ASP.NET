using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("annulation_request")]
public class AnnulationRequest
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("id_planning")]
    public int IdPlanning { get; set; }

    [Column("id_enseignant")]
    public int IdEnseignant { get; set; }

    [Column("motif")]
    public string Motif { get; set; } = string.Empty;

    [Column("statut")]
    public string Statut { get; set; } = "EN_ATTENTE";

    [Column("date_demande")]
    public DateTime DateDemande { get; set; } = DateTime.UtcNow;

    [Column("date_traitement")]
    public DateTime? DateTraitement { get; set; }

    [Column("commentaire_admin")]
    public string? CommentaireAdmin { get; set; }

    [ForeignKey("IdPlanning")]
    public virtual Planning Planning { get; set; } = null!;

    [ForeignKey("IdEnseignant")]
    public virtual Enseignant Enseignant { get; set; } = null!;
}