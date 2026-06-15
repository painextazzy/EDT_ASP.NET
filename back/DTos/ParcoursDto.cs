// Dtos/ParcoursDto.cs
namespace back.Dtos
{
    public class ParcoursDto
    {
        public int Id { get; set; }
        public string Libelle { get; set; } = string.Empty;
    }

    public class CreateParcoursDto
    {
        public string Libelle { get; set; } = string.Empty;
    }

    public class UpdateParcoursDto
    {
        public string Libelle { get; set; } = string.Empty;
    }
}