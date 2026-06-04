namespace back.DTos;

public class SalleDto
{
    public int Id { get; set; }
    public string Numero { get; set; } = string.Empty;
    public string Batiment { get; set; } = string.Empty;
    public int Etage { get; set; }
    public string EtageLabel => Etage == 0 ? "Rez-de-chaussée" : $"Étage {Etage}";

    public string Statut { get; set; } = "LIBRE";
    public string? CourActuel { get; set; }
    public string? Parcours { get; set; }
    public string? Mention { get; set; }
}