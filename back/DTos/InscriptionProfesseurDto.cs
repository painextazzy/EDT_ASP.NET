using System.ComponentModel.DataAnnotations;

namespace back.Dtos;

public class InscriptionProfesseurDto
{
    [Required(ErrorMessage = "Le titre est requis")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom est requis")]
    [RegularExpression(@"^[a-zA-ZÀ-ÿ\s-]+$", ErrorMessage = "Le nom ne doit contenir que des lettres")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le numéro IM est requis")]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Le numéro IM doit contenir exactement 6 chiffres")]
    public string ImNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le téléphone est requis")]
    [RegularExpression(@"^(02|03)\d{8}$", ErrorMessage = "Le téléphone doit commencer par 02 ou 03 et contenir 10 chiffres")]
    public string Phone { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est requis")]
    [MinLength(8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères")]
    public string Password { get; set; } = string.Empty;
}