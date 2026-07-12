using back.Data;
using back.Models;
using Microsoft.EntityFrameworkCore;

namespace back.Services;

public class TeacherSeedService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TeacherSeedService> _logger;

    public TeacherSeedService(AppDbContext context, ILogger<TeacherSeedService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        var email = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_EMAIL") ?? "enseignant@emit.mg";
        var password = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_PASSWORD") ?? "Enseignant2026!";
        var teacherName = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_NAME") ?? "Professeur Demo";
        var teacherIm = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_IM") ?? "EMIT-001";
        var courseName = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_COURSE") ?? "Algorithmique";
        var niveauName = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_NIVEAU") ?? "L1";
        var parcoursName = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_PARCOURS") ?? "Génie logiciel";
        var salleName = Environment.GetEnvironmentVariable("DEFAULT_TEACHER_SALLE") ?? "A101";

        var user = await _context.Utilisateurs.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            user = new Utilisateur
            {
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = "ENSEIGNANT",
                EstValide = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Utilisateurs.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            user.Role = "ENSEIGNANT";
            user.EstValide = true;
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            }

            await _context.SaveChangesAsync();
        }

        var teacher = await _context.Enseignants.FirstOrDefaultAsync(e => e.IdUtilisateur == user.Id || e.Im == teacherIm || e.Nom == teacherName);
        if (teacher == null)
        {
            teacher = new Enseignant
            {
                Im = teacherIm,
                Nom = teacherName,
                IdUtilisateur = user.Id,
                PhotoUrl = "default-avatar.png"
            };

            _context.Enseignants.Add(teacher);
            await _context.SaveChangesAsync();
        }
        else
        {
            teacher.IdUtilisateur = user.Id;
            teacher.Nom = teacherName;
            teacher.Im = teacherIm;
            await _context.SaveChangesAsync();
        }

        var course = await _context.Matieres.FirstOrDefaultAsync(c => c.Nom == courseName || c.Code == "ALG");
        if (course == null)
        {
            course = new Cours
            {
                Code = "ALG",
                Nom = courseName
            };

            _context.Matieres.Add(course);
            await _context.SaveChangesAsync();
        }

        var niveau = await _context.Niveaux.FirstOrDefaultAsync(n => n.Libelle == niveauName);
        if (niveau == null)
        {
            niveau = new Niveau
            {
                Libelle = niveauName
            };

            _context.Niveaux.Add(niveau);
            await _context.SaveChangesAsync();
        }

        var parcours = await _context.Parcours.FirstOrDefaultAsync(p => p.Libelle == parcoursName);
        if (parcours == null)
        {
            parcours = new Parcours
            {
                Libelle = parcoursName
            };

            _context.Parcours.Add(parcours);
            await _context.SaveChangesAsync();
        }

        var salle = await _context.Salles.FirstOrDefaultAsync(s => s.Numero == salleName);
        if (salle == null)
        {
            salle = new Salle
            {
                Numero = salleName,
                Batiment = "A",
                Etage = "1",
                Statut = "LIBRE"
            };

            _context.Salles.Add(salle);
            await _context.SaveChangesAsync();
        }

        var enseignement = await _context.Enseignements.FirstOrDefaultAsync(e =>
            e.IdEnseignant == teacher.Id &&
            e.IdMatiere == course.Id &&
            e.IdNiveau == niveau.Id &&
            e.IdParcours == parcours.Id);

        if (enseignement == null)
        {
            enseignement = new Enseignement
            {
                IdEnseignant = teacher.Id,
                IdMatiere = course.Id,
                IdNiveau = niveau.Id,
                IdParcours = parcours.Id,
                EstTermine = false
            };

            _context.Enseignements.Add(enseignement);
            await _context.SaveChangesAsync();
        }

        var planning = await _context.Plannings.FirstOrDefaultAsync(p => p.IdEnseignement == enseignement.Id && p.Statut == "Actif");
        if (planning == null)
        {
            var start = DateTime.UtcNow.Date.AddDays(1).AddHours(8);
            var end = start.AddHours(2);

            planning = new Planning
            {
                IdEnseignement = enseignement.Id,
                TypeEvenement = "Cours",
                Statut = "Actif",
                DateDebut = start,
                DateFin = end
            };

            _context.Plannings.Add(planning);
            await _context.SaveChangesAsync();

            _context.PlanningSalles.Add(new PlanningSalle
            {
                IdPlanning = planning.Id,
                IdSalle = salle.Id
            });

            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("✅ Compte enseignant prêt : {Email} / {Password}", email, password);
    }
}
