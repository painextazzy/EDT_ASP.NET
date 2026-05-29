using Microsoft.EntityFrameworkCore;
using back.Models;

namespace back.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // ========== ENTITÉS EXISTANTES (vos collègues) ==========
        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Enseignant> Enseignants { get; set; }

        // ========== NOUVELLES ENTITÉS (gestion des cours et affectations) ==========
        public DbSet<Cours> Matieres { get; set; }
        public DbSet<Niveau> Niveaux { get; set; }
        public DbSet<Parcours> Parcours { get; set; }
        public DbSet<Enseignement> Enseignements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ========== CONFIGURATION EXISTANTE (vos collègues) ==========
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
                      .WithMany()
                      .HasForeignKey(e => e.IdUtilisateur)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // ========== NOUVELLES CONFIGURATIONS ==========
            
            // Table Matiere (Cours)
            modelBuilder.Entity<Cours>(entity =>
            {
                entity.ToTable("matiere");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Code).HasColumnName("code");
                entity.Property(e => e.Nom).HasColumnName("libelle");
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // Table Niveau
            modelBuilder.Entity<Niveau>(entity =>
            {
                entity.ToTable("niveau");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Libelle).HasColumnName("libelle");
                entity.HasIndex(e => e.Libelle).IsUnique();
            });

            // Table Parcours
            modelBuilder.Entity<Parcours>(entity =>
            {
                entity.ToTable("parcours");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Libelle).HasColumnName("libelle");
                entity.HasIndex(e => e.Libelle).IsUnique();
            });

            // Table Enseignement
            modelBuilder.Entity<Enseignement>(entity =>
            {
                entity.ToTable("enseignement");
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.IdEnseignant).HasColumnName("id_enseignant");
                entity.Property(e => e.IdMatiere).HasColumnName("id_matiere");
                entity.Property(e => e.IdNiveau).HasColumnName("id_niveau");
                entity.Property(e => e.IdParcours).HasColumnName("id_parcours");
                entity.Property(e => e.EstTermine).HasColumnName("est_termine");

                // Relations
                entity.HasOne(e => e.Enseignant)
                      .WithMany()
                      .HasForeignKey(e => e.IdEnseignant)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Cours)
                      .WithMany()
                      .HasForeignKey(e => e.IdMatiere)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Niveau)
                      .WithMany()
                      .HasForeignKey(e => e.IdNiveau)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Parcours)
                      .WithMany()
                      .HasForeignKey(e => e.IdParcours)
                      .OnDelete(DeleteBehavior.Cascade);

                // Index unique pour éviter les doublons
                entity.HasIndex(e => new { e.IdEnseignant, e.IdMatiere, e.IdNiveau, e.IdParcours })
                      .IsUnique();
            });
        }
    }
}