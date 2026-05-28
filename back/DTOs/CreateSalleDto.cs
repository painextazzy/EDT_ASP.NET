using System.ComponentModel.DataAnnotations;

namespace GestionSalles.API.DTOs;

/// <summary>DTO de création</summary>
public class CreateSalleDto
{
    [Required(ErrorMessage = "Le numéro de salle est obligatoire.")]
    [MinLength(2, ErrorMessage = "Le numéro de salle doit contenir au moins 2 caractères.")]
    [MaxLength(50, ErrorMessage = "Le numéro de salle ne peut pas dépasser 50 caractères.")]
    [RegularExpression(@"^[A-Za-z0-9\-_\s]+$",
        ErrorMessage = "Le numéro de salle ne peut contenir que des lettres, chiffres, tirets et underscores.")]
    public string NomSalle { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le bâtiment est obligatoire.")]
    [MinLength(2, ErrorMessage = "Le nom du bâtiment doit contenir au moins 2 caractères.")]
    [MaxLength(100, ErrorMessage = "Le nom du bâtiment ne peut pas dépasser 100 caractères.")]
    public string Batiment { get; set; } = string.Empty;

    [Range(0, 20, ErrorMessage = "L'étage doit être compris entre 0 (RDC) et 20.")]
    public int Etage { get; set; } = 0;
}