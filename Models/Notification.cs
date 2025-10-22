// File: Models/Notification.cs
using System.ComponentModel.DataAnnotations;

namespace Bidforge.Models;

public class Notification
{
    public int Id { get; set; }

    [MaxLength(450)]
    public string UserId { get; set; } = default!;
    public ApplicationUser User { get; set; } = default!;

    [MaxLength(50)]
    public string Type { get; set; } = "info"; // "bid_placed", "outbid", "winner_purchased", etc.

    [MaxLength(400)]
    public string Message { get; set; } = default!;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; } = false;

    // Optional JSON payload (like auctionId, bidId)
    public string? DataJson { get; set; }
}
