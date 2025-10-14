namespace Bidforge.Dtos;

public class AuctionListResponse
{
    public List<AuctionListItemDto> Items { get; set; } = new();
    public int Total { get; set; }
}
