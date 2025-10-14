namespace Bidforge.Dtos;

public class AuctionListItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public decimal CurrentBid { get; set; }
    public string? EndTime { get; set; }      // ISO string for the frontend
    public string? Badge { get; set; }
    public string CreatedAt { get; set; } = string.Empty; // ISO
}
