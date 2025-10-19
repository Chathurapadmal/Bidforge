using Bidforge.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<PasswordResetTicket> PasswordResetTickets => Set<PasswordResetTicket>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        // Money columns
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

        // ApplicationUser.CreatedAt default + index
        mb.Entity<ApplicationUser>()
          .Property(u => u.CreatedAt)
          .HasDefaultValueSql("SYSUTCDATETIME()");

        mb.Entity<ApplicationUser>()
          .HasIndex(u => u.CreatedAt);

        // Password reset tickets: lookup-friendly index
        mb.Entity<PasswordResetTicket>()
          .HasIndex(x => new { x.UserId, x.CreatedAt });
    }
}
