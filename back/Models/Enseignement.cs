using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("enseignement")]
public class Enseignement
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("id_enseignant")]
    public int IdEnseignant { get; set; }
    
    [Column("id_matiere")]
    public int IdMatiere { get; set; }
    
    [Column("id_niveau")]
    public int IdNiveau { get; set; }
    
    [Column("id_parcours")]
    public int IdParcours { get; set; }
    
    [Column("est_termine")]
    public bool EstTermine { get; set; } = false;
    
    // Navigation properties - Sans l'opérateur null propagating
    [ForeignKey("IdEnseignant")]
    public virtual Enseignant Enseignant { get; set; } = null!;
    
    [ForeignKey("IdMatiere")]
    public virtual Cours Cours { get; set; } = null!;
    
    [ForeignKey("IdNiveau")]
    public virtual Niveau Niveau { get; set; } = null!;
    
    [ForeignKey("IdParcours")]
    public virtual Parcours Parcours { get; set; } = null!;
}