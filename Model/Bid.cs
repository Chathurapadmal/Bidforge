using System.ComponentModel.DataAnnotations;

namespace AuctionSystem.Models
{
    public class Bid
    {
        public int Id { get; set; }

        public decimal Amount { get; set; }

        public DateTime BidTime { get; set; } = DateTime.Now;

        public int AuctionId { get; set; }

        public Auction Auction { get; set; }

        public int UserId { get; set; }

        public User User { get; set; }
    }
}
