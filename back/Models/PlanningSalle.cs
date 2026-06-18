// Models/PlanningSalle.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back.Models
{
    [Table("planning_salle")]
    public class PlanningSalle
    {
        [Key]
        [Column("id_planning", Order = 0)]
        public int IdPlanning { get; set; }

        [Key]
        [Column("id_salle", Order = 1)]
        public int IdSalle { get; set; }

        [ForeignKey("IdPlanning")]
        public virtual Planning Planning { get; set; } = null!;

        [ForeignKey("IdSalle")]
        public virtual Salle Salle { get; set; } = null!;
    }
}