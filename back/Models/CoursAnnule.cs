// Models/CoursAnnule.cs
namespace back.Models
{
    public class CoursAnnule
    {
        public int Id { get; set; }
        public string Matiere { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Horaire { get; set; } = string.Empty;
        public string Salle { get; set; } = string.Empty;
        public string Motif { get; set; } = string.Empty;
    }
}