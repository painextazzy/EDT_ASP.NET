// Models/DTOs/AuthDto.cs
using System.ComponentModel.DataAnnotations;

namespace back.Models.DTOs;

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;  // 👈 Le rôle
    public string RedirectUrl { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public int UserId { get; set; }
    public bool EstValide { get; set; }

    // ✅ Ajout des champs pour l'enseignant
    public string? Nom { get; set; }      // Nom de l'enseignant
    public string? PhotoUrl { get; set; } // Photo de l'enseignant
}