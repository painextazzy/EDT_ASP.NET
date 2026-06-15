using System.ComponentModel.DataAnnotations;

namespace back.Models;

public class Delegue
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string NomDelegue { get; set; } = string.Empty;

    [Required]
    public string EmailDelegue { get; set; } = string.Empty;

    public int IdNiveau { get; set; }
    public virtual Niveau Niveau { get; set; } = null!;

    public int IdParcours { get; set; }
    public virtual Parcours Parcours { get; set; } = null!;
}