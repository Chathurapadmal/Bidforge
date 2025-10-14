using Bidforge.Models;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Data;

public static class Seed
{
    public static async Task RunAsync(AppDbContext db)
    {
        if (await db.Auctions.AnyAsync()) return;

        var now = DateTime.UtcNow;

        var a1 = new Auction
        {
            Title = "Apple iPhone 13 (Blue, 128GB)",
            Description = "Lightly used. Original box.",
            Image = "iphone13-blue.jpg",
            CurrentBid = 145000,
            EndTime = now.AddDays(2),
            Badge = "HOT",
            CreatedAt = now
        };
        a1.SetImages(new[] { "iphone13-blue.jpg" });

        var a2 = new Auction
        {
            Title = "GoPro HERO 11",
            Description = "Excellent condition.",
            Image = "gopro11.jpg",
            CurrentBid = 98000,
            EndTime = now.AddHours(10),
            Badge = "NEW",
            CreatedAt = now
        };
        a2.SetImages(new[] { "gopro11.jpg" });

        var a3 = new Auction
        {
            Title = "Dell XPS 13 9370",
            Description = "Battery 85%, minor scratches.",
            Image = "xps13.jpg",
            CurrentBid = 210000,
            EndTime = now.AddDays(-1), // ended
            CreatedAt = now
        };
        a3.SetImages(new[] { "xps13.jpg" });

        db.Auctions.AddRange(a1, a2, a3);
        await db.SaveChangesAsync();
    }
}
