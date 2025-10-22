// File: Models/Bid.cs
using System.ComponentModel.DataAnnotations;

namespace Bidforge.Models;

public class Bid
{
    public int Id { get; set; }

    [Required]
    public int AuctionId { get; set; }
    public Auction Auction { get; set; } = default!;

    [Required, Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    [MaxLength(450)]
    public string? BidderId { get; set; }
    public ApplicationUser? Bidder { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
