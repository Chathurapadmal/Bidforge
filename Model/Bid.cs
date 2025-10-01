namespace Bidforge.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = default!;
        public decimal Amount { get; set; }
        public DateTime PlacedAt { get; set; }
    }
}
