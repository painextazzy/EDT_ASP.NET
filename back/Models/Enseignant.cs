namespace back.Models
{
    public class Enseignant
    {
        public int Id { get; set; }
        public string Im { get; set; } = string.Empty;
        public string Nom { get; set; } = string.Empty;

        public string PhotoUrl { get; set; } = "/images/avatars/default-avatar.jpg";

        public int IdUtilisateur { get; set; }
        public Utilisateur? Utilisateur { get; set; }
    }
}