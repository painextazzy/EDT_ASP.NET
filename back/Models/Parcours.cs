using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("parcours")]
public class Parcours
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("libelle")]
    public string Libelle { get; set; } = string.Empty;
}