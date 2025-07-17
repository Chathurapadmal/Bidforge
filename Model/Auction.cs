using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

namespace AuctionSystem.Models
{
    public class Auction
    {
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        public string ImageUrl { get; set; }

        [Required]
        public decimal StartingPrice { get; set; }

        public decimal CurrentPrice { get; set; }

        public DateTime StartTime { get; set; }

        public DateTime EndTime { get; set; }

        public int SellerId { get; set; }

        public User Seller { get; set; }

        public ICollection<Bid> Bids { get; set; }
    }
}
