using back.Data;
using back.Dtos;
using back.Models;
using Microsoft.EntityFrameworkCore;

namespace back.Services;

public class InscriptionService
{
    private readonly AppDbContext _context;

    public InscriptionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<InscriptionResponseDto> InscrireProfesseur(InscriptionProfesseurDto dto)
    {
        // Vérifier si l'email existe déjà
        var emailExiste = await _context.Utilisateurs.AnyAsync(u => u.Email == dto.Email);
        if (emailExiste)
        {
            return new InscriptionResponseDto
            {
                Success = false,
                Message = "Cet email est déjà utilisé"
            };
        }

        // Vérifier si le numéro IM existe déjà
        var imExiste = await _context.Enseignants.AnyAsync(e => e.Im == dto.ImNumber);
        if (imExiste)
        {
            return new InscriptionResponseDto
            {
                Success = false,
                Message = "Ce numéro IM est déjà utilisé"
            };
        }

        // Créer l'utilisateur
        var utilisateur = new Utilisateur
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "ENSEIGNANT",
            EstValide = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Utilisateurs.Add(utilisateur);
        await _context.SaveChangesAsync();

        // Créer l'enseignant
        var enseignant = new Enseignant
        {
            Im = dto.ImNumber,
            Nom = $"{dto.Title} {dto.FirstName}",
            PhotoUrl = "/images/avatars/default-avatar.png",
            IdUtilisateur = utilisateur.Id
        };

        _context.Enseignants.Add(enseignant);
        await _context.SaveChangesAsync();

        return new InscriptionResponseDto
        {
            Success = true,
            Message = "Inscription réussie ! En attente de validation.",
            EnseignantId = enseignant.Id
        };
    }

    // --- CETTE MÉTHODE MANQUAIT ET PROVOQUAIT L'ERREUR CS1061 ---
    public async Task<bool> ValiderEnseignant(int id) // Retourne Task<bool>
    {
        var enseignant = await _context.Enseignants.FindAsync(id);
        if (enseignant == null) return false; // Retourne false si non trouvé

        var utilisateur = await _context.Utilisateurs.FindAsync(enseignant.IdUtilisateur);
        if (utilisateur == null) return false;

        utilisateur.EstValide = true;
        await _context.SaveChangesAsync();
        return true; // Retourne true si tout est ok
    }
}