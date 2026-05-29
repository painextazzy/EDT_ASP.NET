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
}

public class CreateAffectationDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Professor { get; set; } = string.Empty;
    public string Mention { get; set; } = string.Empty;
    public string Niveau { get; set; } = string.Empty;
}

public class UpdateAffectationDto
{
    public string Name { get; set; } = string.Empty;
    public string Professor { get; set; } = string.Empty;
    public string Mention { get; set; } = string.Empty;
    public string Niveau { get; set; } = string.Empty;
}