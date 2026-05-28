using Microsoft.EntityFrameworkCore;
using back.Models;

namespace back.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Utilisateur> Utilisateurs { get; set; }
        public DbSet<Enseignant> Enseignants { get; set; }

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
                      .WithMany()
                      .HasForeignKey(e => e.IdUtilisateur)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }
    }
}