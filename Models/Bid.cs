using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bidforge.Models;

public class Bid
{
    public int Id { get; set; }

    // FK to Auction
    public int AuctionId { get; set; }
    public Auction Auction { get; set; } = default!;

    // FK to user placing the bid
    [Required]
    public string UserId { get; set; } = default!;
    public ApplicationUser User { get; set; } = default!;

    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
