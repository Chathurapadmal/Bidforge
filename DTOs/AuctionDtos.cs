using Microsoft.AspNetCore.Http;

namespace Bidforge.DTOs;

public class CreateAuctionForm
{
    public string Title { get; set; } = "";
    public string? Description { get; set; }
    public decimal StartingBid { get; set; } = 0;
    public DateTime? EndTimeUtc { get; set; }  // required by UI
    public string? Badge { get; set; }

    public IFormFile? Image { get; set; }      // optional image upload
}

public record AuctionDto(
    int Id,
    string Title,
    decimal CurrentBid,
    DateTime? StartTime,
    DateTime? EndTime,
    string? Image,
    string? Badge
);
