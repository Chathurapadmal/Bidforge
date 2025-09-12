namespace Bidforge.Model;

public enum AuctionStatus { Draft = 0, Active = 1, Ended = 2, Cancelled = 3 }

public class Auction
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public decimal StartingPrice { get; set; }
    public decimal? CurrentPrice { get; set; }  // highest bid
    public int BidsCount { get; set; }

    public decimal? BuyNowPrice { get; set; }
    public string ImageUrl { get; set; } = string.Empty;

    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public AuctionStatus Status { get; set; } = AuctionStatus.Active;
}
