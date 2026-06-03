using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("salle")]
public class Salle
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nom_salle")]
    public string NomSalle { get; set; } = string.Empty;

    [Column("batiment")]
    public string Batiment { get; set; } = string.Empty;

    [Column("etage")]
    public int Etage { get; set; } = 0;
}
