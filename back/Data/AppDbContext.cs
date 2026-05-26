using GestionSalles.API.Models;
using Microsoft.EntityFrameworkCore;

namespace GestionSalles.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Salle> Salles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Contrainte unicité : même numéro de salle dans le même bâtiment
        modelBuilder.Entity<Salle>()
            .ToTable("salle");

        modelBuilder.Entity<Salle>()
            .HasIndex(s => new { s.NomSalle, s.Batiment })
            .IsUnique()
            .HasDatabaseName("IX_Salle_NomSalle_Batiment");

        modelBuilder.Entity<Salle>()
            .Property(s => s.Etage)
            .HasDefaultValue(0);
    }
}