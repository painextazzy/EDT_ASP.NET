using Microsoft.EntityFrameworkCore;
using back.Models;

namespace back.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Enseignant> Enseignants { get; set; }
        public DbSet<Salle> Salles { get; set; }
        public DbSet<Cours> Matieres { get; set; } = null!;
        public DbSet<Niveau> Niveaux { get; set; } = null!;
        public DbSet<Parcours> Parcours { get; set; } = null!;
        public DbSet<Enseignement> Enseignements { get; set; } = null!;


        // ========== NOUVEAU : Planning ==========
        public DbSet<Planning> Plannings { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Utilisateur>(entity =>
            {
                entity.ToTable("utilisateur");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Email).HasColumnName("email");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at");
                entity.Property(e => e.PasswordHash).HasColumnName("password_hash");
                entity.Property(e => e.EstValide).HasColumnName("est_valide");
                entity.Property(e => e.Role).HasColumnName("role");
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Enseignant>(entity =>
            {
                entity.ToTable("enseignant");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Im).HasColumnName("im");
                entity.Property(e => e.Nom).HasColumnName("nom");
                entity.Property(e => e.PhotoUrl).HasColumnName("photo_url");
                entity.Property(e => e.IdUtilisateur).HasColumnName("id_utilisateur");
                entity.HasIndex(e => e.Im).IsUnique();

                entity.HasOne(e => e.Utilisateur)
                      .WithOne(u => u.Enseignant)
                      .HasForeignKey<Enseignant>(e => e.IdUtilisateur)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Salle>(entity =>
            {
                entity.ToTable("salle");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Numero).HasColumnName("nom_salle");
                entity.Property(e => e.Batiment).HasColumnName("batiment");
                entity.Property(e => e.Etage).HasColumnName("etage");
                entity.Property(e => e.Statut).HasColumnName("statut").HasDefaultValue("LIBRE");
                entity.Property(e => e.CourActuel).HasColumnName("cour_actuel");
            });

            modelBuilder.Entity<Cours>(entity =>
            {
                entity.ToTable("matiere");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Code).HasColumnName("code");
                entity.Property(e => e.Nom).HasColumnName("libelle");
            });

            modelBuilder.Entity<Parcours>(entity =>
            {
                entity.ToTable("parcours");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Libelle).HasColumnName("libelle");
            });
            
            modelBuilder.Entity<Niveau>(entity =>
            {
                entity.ToTable("niveau");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Libelle).HasColumnName("libelle");
                entity.HasIndex(e => e.Libelle).IsUnique();
            });

            modelBuilder.Entity<Enseignement>(entity =>
            {
                entity.ToTable("enseignement");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.IdEnseignant).HasColumnName("id_enseignant");
                entity.Property(e => e.IdMatiere).HasColumnName("id_matiere");
                entity.Property(e => e.IdNiveau).HasColumnName("id_niveau");
                entity.Property(e => e.IdParcours).HasColumnName("id_parcours");
                entity.Property(e => e.EstTermine).HasColumnName("est_termine");

                entity.HasOne(e => e.Enseignant).WithMany().HasForeignKey(e => e.IdEnseignant);
                entity.HasOne(e => e.Cours).WithMany().HasForeignKey(e => e.IdMatiere);
                entity.HasOne(e => e.Niveau).WithMany().HasForeignKey(e => e.IdNiveau);
                entity.HasOne(e => e.Parcours).WithMany().HasForeignKey(e => e.IdParcours);
            });


            // Configuration pour l'entité Delegue
            modelBuilder.Entity<Delegue>(entity =>
            {
                entity.ToTable("delegue");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.NomDelegue).HasColumnName("nom_delegue");
                entity.Property(e => e.EmailDelegue).HasColumnName("email_delegue");
                entity.Property(e => e.IdNiveau).HasColumnName("id_niveau");
                entity.Property(e => e.IdParcours).HasColumnName("id_parcours");

                entity.HasOne(d => d.Niveau).WithMany().HasForeignKey(d => d.IdNiveau);
                entity.HasOne(d => d.Parcours).WithMany().HasForeignKey(d => d.IdParcours);
                
                // Contrainte d'unicité Niveau/Parcours
                entity.HasIndex(d => new { d.IdNiveau, d.IdParcours }).IsUnique();

            // ========== NOUVEAU : Configuration pour Planning ==========
            modelBuilder.Entity<Planning>(entity =>
            {
                entity.ToTable("planning");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.IdEnseignement).HasColumnName("id_enseignement");
                entity.Property(e => e.TypeEvenement).HasColumnName("type_evenement");
                entity.Property(e => e.Statut).HasColumnName("statut");
                entity.Property(e => e.DateDebut).HasColumnName("date_debut");
                entity.Property(e => e.DateFin).HasColumnName("date_fin");
                entity.Property(e => e.MotifAnnulation).HasColumnName("motif_annulation");
                
                entity.HasOne(e => e.Enseignement)
                      .WithMany()
                      .HasForeignKey(e => e.IdEnseignement)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasIndex(e => e.DateDebut);
                entity.HasIndex(e => e.DateFin);

            });
        }
    }
}