using System.ComponentModel.DataAnnotations;

namespace Bidforge.DTOs;

public class CreateAuctionRequest
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Image { get; set; } 

    [Range(0, 999999999)]
    public decimal CurrentBid { get; set; }  

    public DateTime? EndTime { get; set; }

    [MaxLength(40)]
    public string? Badge { get; set; }
}

public class UpdateAuctionRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Image { get; set; }

    [Range(0, 999999999)]
    public decimal? CurrentBid { get; set; }

    public DateTime? EndTime { get; set; }

    [MaxLength(40)]
    public string? Badge { get; set; }
}
