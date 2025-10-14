using Bidforge.Data;
using Bidforge.Models;
using Bidforge.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/auctions/{auctionId:int}/[controller]")]
public class BidsController(AppDbContext db) : ControllerBase
{
    private const decimal MinIncrement = 100m; // keep in sync with frontend

    // GET /api/auctions/{auctionId}/bids?limit=50
    [HttpGet]
    public async Task<IActionResult> Get(int auctionId, [FromQuery] int? limit = 50)
    {
        if (!await db.Auctions.AnyAsync(a => a.Id == auctionId))
            return NotFound(new { message = "Auction not found." });

        var take = Math.Clamp(limit ?? 50, 1, 200);

        var items = await db.Bids
            .AsNoTracking()
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.CreatedAt)
            .Take(take)
            .Select(b => new {
                id = b.Id,
                amount = b.Amount,
                bidder = b.Bidder, // may be null; frontend shows "Guest"
                createdAt = b.CreatedAt.ToString("o")
            })
            .ToListAsync();

        return Ok(new { items });
    }

    public record PlaceBidDto(decimal Amount, string? Bidder);

    // POST /api/auctions/{auctionId}/bids  body: { amount, bidder? }
    [HttpPost]
    public async Task<IActionResult> Post(int auctionId, [FromBody] PlaceBidDto dto)
    {
        var auction = await db.Auctions.FirstOrDefaultAsync(a => a.Id == auctionId);
        if (auction == null) return NotFound(new { message = "Auction not found." });

        var now = DateTime.UtcNow;
        if (auction.EndTime != null && auction.EndTime <= now)
            return BadRequest(new { message = "Auction has ended." });

        if (dto.Amount <= 0)
            return BadRequest(new { message = "Amount must be positive." });

        var last = auction.CurrentBid;
        var minNext = last + MinIncrement;
        if (dto.Amount < minNext)
            return BadRequest(new { message = $"Minimum next bid is {minNext}." });

        var bid = new Bid
        {
            AuctionId = auctionId,
            Amount = dto.Amount,
            Bidder = string.IsNullOrWhiteSpace(dto.Bidder) ? "Guest" : dto.Bidder.Trim(),
            CreatedAt = now
        };

        // persist bid and update auction current bid
        db.Bids.Add(bid);
        auction.CurrentBid = dto.Amount;
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { auctionId }, new
        {
            id = bid.Id,
            amount = bid.Amount,
            bidder = bid.Bidder,
            createdAt = bid.CreatedAt.ToString("o")
        });
    }
}
