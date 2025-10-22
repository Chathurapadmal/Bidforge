// File: Mapping/AuctionMapper.cs
using Bidforge.Models;

namespace Bidforge.Mapping;

public static class AuctionMapper
{
    public static object ToListDto(this Auction a) => new
    {
        id = a.Id,
        title = a.Title,
        currentBid = a.CurrentBid,
        startTime = a.CreatedAtUtc, // alias of StartTimeUtc
        endTime = a.EndTimeUtc,
        image = a.Image,
        badge = a.Badge
    };

    public static object ToDetailDto(this Auction a) => new
    {
        id = a.Id,
        title = a.Title,
        description = a.Description,
        currentBid = a.CurrentBid,
        startTime = a.CreatedAtUtc,
        endTime = a.EndTimeUtc,
        image = a.Image,
        badge = a.Badge,
        sellerId = a.SellerId
    };
}
