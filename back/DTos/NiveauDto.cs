// Dtos/NiveauDto.cs
namespace back.Dtos
{
    public class NiveauDto
    {
        public int Id { get; set; }
        public string Libelle { get; set; } = string.Empty;
    }

    public class CreateNiveauDto
    {
        public string Libelle { get; set; } = string.Empty;
    }

    public class UpdateNiveauDto
    {
        public string Libelle { get; set; } = string.Empty;
    }
}