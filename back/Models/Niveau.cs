using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("niveau")]
public class Niveau
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("libelle")]
    public string Libelle { get; set; } = string.Empty;
}