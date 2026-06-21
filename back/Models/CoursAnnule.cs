namespace back.Models
{
    public class CoursAnnule
    {
        public int Id { get; set; }
        public string NomMatiere { get; set; } = "";
        public string CodeMatiere { get; set; } = "";
        public DateTime DateDebut { get; set; }
        public DateTime DateFin { get; set; }
        public string MotifAnnulation { get; set; } = "";
        public string NomSalle { get; set; } = "";
        public string Batiment { get; set; } = "";
    }
}