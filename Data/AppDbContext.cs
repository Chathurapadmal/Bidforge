// File: Data/AppDbContext.cs
using Bidforge.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Auction> Auctions => Set<Auction>();
    public DbSet<Bid> Bids => Set<Bid>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // Auction
        b.Entity<Auction>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(4000);
            e.Property(x => x.Badge).HasMaxLength(100);
            e.Property(x => x.Image).HasMaxLength(500);
            e.Property(x => x.CurrentBid).HasPrecision(18, 2);
            e.Property(x => x.EndTimeUtc).IsRequired();

            e.HasOne(x => x.Seller)
             .WithMany()
             .HasForeignKey(x => x.SellerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Winner)
             .WithMany()
             .HasForeignKey(x => x.WinnerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasMany(x => x.Bids)
             .WithOne(x => x.Auction)
             .HasForeignKey(x => x.AuctionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Bid
        b.Entity<Bid>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);

            e.HasOne(x => x.Bidder)
             .WithMany()
             .HasForeignKey(x => x.BidderId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Notification
        b.Entity<Notification>(e =>
        {
            e.Property(x => x.Type).HasMaxLength(50).IsRequired();
            e.Property(x => x.Message).HasMaxLength(400).IsRequired();

            e.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
