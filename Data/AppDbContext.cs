using Bidforge.Models;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Auction> Auctions => Set<Auction>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        mb.Entity<Auction>()
          .Property(a => a.CurrentBid)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Auction>()
          .Property(a => a.CreatedAt)
          .HasDefaultValueSql("SYSUTCDATETIME()");

        mb.Entity<Auction>()
          .HasIndex(a => a.CreatedAt)
          .HasDatabaseName("IX_Auctions_CreatedAt");
    }
}
