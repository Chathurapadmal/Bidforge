using Bidforge.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        // Auction money columns
        mb.Entity<Auction>()
          .Property(a => a.CurrentBid)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Bid>()
          .Property(b => b.Amount)
          .HasColumnType("decimal(18,2)");

        // Auction.CreatedAt default + index (if your Auction has CreatedAt)
        mb.Entity<Auction>()
          .Property(a => a.CreatedAt)
          .HasDefaultValueSql("SYSUTCDATETIME()");

        mb.Entity<Auction>()
          .HasIndex(a => a.CreatedAt)
          .HasDatabaseName("IX_Auctions_CreatedAt");

        // ApplicationUser.CreatedAt default + index  ✅ (corrected)
        mb.Entity<ApplicationUser>()
          .Property(u => u.CreatedAt)
          .HasDefaultValueSql("SYSUTCDATETIME()");

        mb.Entity<ApplicationUser>()
          .HasIndex(u => u.CreatedAt);
    }
}
