using Bidforge.Models;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (await db.Auctions.AnyAsync()) return;

        db.Auctions.AddRange(
            new Auction { Title = "PS5 Slim", Image = "/images/ps5.jpg", CurrentBid = 180000, Badge = "New", EndTime = DateTime.UtcNow.AddDays(3), CreatedAt = DateTime.UtcNow.AddMinutes(-2) },
            new Auction { Title = "GoPro Hero 12", Image = "/images/gopro.jpg", CurrentBid = 120000, Badge = "Hot", EndTime = DateTime.UtcNow.AddDays(2), CreatedAt = DateTime.UtcNow.AddMinutes(-5) },
            new Auction { Title = "iPhone 14 Pro", Image = "/images/iphone14pro.jpg", CurrentBid = 315000, EndTime = DateTime.UtcNow.AddDays(5), CreatedAt = DateTime.UtcNow.AddMinutes(-8) }
        );

        await db.SaveChangesAsync();
    }
}
