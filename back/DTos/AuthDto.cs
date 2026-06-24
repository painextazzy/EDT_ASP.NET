// Models/DTOs/AuthDto.cs
using System.ComponentModel.DataAnnotations;

namespace back.Models.DTOs
{
    public class LoginDto
    {
        [Required(ErrorMessage = "L'email est requis")]
        [EmailAddress(ErrorMessage = "Email invalide")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Le mot de passe est requis")]
        [MinLength(6, ErrorMessage = "Le mot de passe doit contenir au moins 6 caractères")]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string RedirectUrl { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public int UserId { get; set; }
        public bool EstValide { get; set; }
        public EnseignantInfoDto? Enseignant { get; set; }
    }

    public class EnseignantInfoDto
    {
        public int Id { get; set; }
        public string Im { get; set; } = string.Empty;
        public string Nom { get; set; } = string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;
    }
}