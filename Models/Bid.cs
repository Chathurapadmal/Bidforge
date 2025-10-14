namespace Bidforge.Models;

public class Bid
{
    public int Id { get; set; }

    public int AuctionId { get; set; }
    public Auction? Auction { get; set; }

    public decimal Amount { get; set; }

    // optional display name shown on product detail page
    public string? Bidder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
