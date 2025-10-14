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

        mb.Entity<Auction>()
          .Property(a => a.CurrentBid)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Bid>()
          .Property(b => b.Amount)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Auction>()
          .HasIndex(a => a.CreatedAt)
          .HasDatabaseName("IX_Auctions_CreatedAt");
    }
}
