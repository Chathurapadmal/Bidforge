using System.ComponentModel.DataAnnotations;

namespace Bidforge.Models;

public class Auction
{
    public int Id { get; set; }

    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Image { get; set; }

    public decimal CurrentBid { get; set; }  

    public DateTime? EndTime { get; set; }

    public string? Badge { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
