using System.ComponentModel.DataAnnotations;

namespace back.DTOs
{
    public class UpdateCoursAnnuleDto
    {
        [Required(ErrorMessage = "La matière est requise")]
        [MaxLength(100)]
        public string Matiere { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [MaxLength(50)]
        public string Horaire { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Salle { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Motif { get; set; } = string.Empty;
    }
}