// Dtos/PlanningDto.cs
namespace back.Dtos
{
    public class PlanningDto
    {
        public int IdEnseignement { get; set; }
        public string TypeEvenement { get; set; } = "Cours";
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public List<int> IdSalles { get; set; } = new List<int>();
        public string? MotifAnnulation { get; set; }
    }
}