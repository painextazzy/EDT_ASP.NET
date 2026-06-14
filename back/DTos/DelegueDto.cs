using System.ComponentModel.DataAnnotations;

namespace back.Dtos;

public class DelegueDto
{
    public int Id { get; set; }
    public string NomDelegue { get; set; } = string.Empty;
    public string EmailDelegue { get; set; } = string.Empty;
    public int IdNiveau { get; set; }
    public string NiveauLibelle { get; set; } = string.Empty;
    public int IdParcours { get; set; }
    public string ParcoursLibelle { get; set; } = string.Empty;
}

public class CreateDelegueDto
{
    [Required]
    public string NomDelegue { get; set; } = string.Empty;
    [Required, EmailAddress]
    public string EmailDelegue { get; set; } = string.Empty;
    [Required]
    public int IdNiveau { get; set; }
    [Required]
    public int IdParcours { get; set; }
}