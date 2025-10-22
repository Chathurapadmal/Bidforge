using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Bidforge.Models;

public class Auction
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = default!;

    [MaxLength(4000)]
    public string? Description { get; set; }

    [Range(0, double.MaxValue)]
    public decimal CurrentBid { get; set; } = 0m;

    [Required]
    public DateTime EndTimeUtc { get; set; }

    [MaxLength(100)]
    public string? Badge { get; set; }

    [MaxLength(500)]
    public string? Image { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public DateTime StartTimeUtc
    {
        get => CreatedAtUtc;
        set => CreatedAtUtc = value;
    }

    [MaxLength(450)]
    public string? SellerId { get; set; }
    public ApplicationUser? Seller { get; set; }

    public ICollection<Bid> Bids { get; set; } = new List<Bid>();

    // NEW: winner/purchase info
    [MaxLength(450)]
    public string? WinnerId { get; set; }
    public ApplicationUser? Winner { get; set; }
    public DateTime? PurchasedAtUtc { get; set; }
}
