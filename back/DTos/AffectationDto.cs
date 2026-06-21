// back/Dtos/AffectationDto.cs
namespace back.Dtos;

public class AffectationDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Professor { get; set; } = string.Empty;
    public string ProfessorAvatar { get; set; } = string.Empty;
    public string Mention { get; set; } = string.Empty;
    public string Niveau { get; set; } = string.Empty;
    public int CoursId { get; set; }          // ← Ajouter
    public int ProfesseurId { get; set; }     // ← Ajouter
}

public class CreateAffectationDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Professor { get; set; } = string.Empty;
    public string Mention { get; set; } = string.Empty;
    public string Niveau { get; set; } = string.Empty;
    public int CoursId { get; set; }
    public int ProfesseurId { get; set; }
}

public class UpdateAffectationDto
{
    public string Name { get; set; } = string.Empty;
    public string Professor { get; set; } = string.Empty;
    public string Mention { get; set; } = string.Empty;
    public string Niveau { get; set; } = string.Empty;
}