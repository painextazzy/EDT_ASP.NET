// Dtos/EnseignantAVerifierDto.cs
namespace back.Dtos
{
    public class EnseignantAVerifierDto
    {
        public int Id { get; set; }
        public string Nom { get; set; } = string.Empty;
        public string Im { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhotoUrl { get; set; } = string.Empty;
    }
}