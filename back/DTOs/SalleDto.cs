namespace GestionSalles.API.DTOs;

/// <summary>DTO de lecture — retourné au client</summary>
public class SalleDto
{
    public int Id { get; set; }
    public string NomSalle { get; set; } = string.Empty;
    public string Batiment { get; set; } = string.Empty;
    public int Etage { get; set; }
    public string EtageLabel => Etage == 0 ? "Rez-de-chaussée" : $"Étage {Etage}";
}