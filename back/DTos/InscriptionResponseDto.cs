namespace back.Dtos;

public class InscriptionResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int? EnseignantId { get; set; }
}