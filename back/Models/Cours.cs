using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models;

[Table("matiere")]
public class Cours
{
    [Key]
    [Column("id")]
    public int Id { get; set; }
    
    [Column("code")]
    public string Code { get; set; } = string.Empty;
    
    [Column("libelle")]
    public string Nom { get; set; } = string.Empty;
}