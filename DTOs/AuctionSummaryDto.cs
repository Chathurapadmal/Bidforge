namespace Bidforge.DTOs;

public class AuctionSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string? Image { get; set; }
    public decimal CurrentBid { get; set; }
    public DateTime? EndTime { get; set; }
    public string? Badge { get; set; }
}
