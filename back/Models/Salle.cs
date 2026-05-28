using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GestionSalles.API.Models;

public class Salle
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string NomSalle { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Batiment { get; set; } = string.Empty;

    public int Etage { get; set; } = 0;
}