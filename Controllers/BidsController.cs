// File: Controllers/BidsController.cs
using System.Security.Claims;
using Bidforge.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Authorize]
public class BidsController : ControllerBase
{
    private readonly AppDbContext _db;
    public BidsController(AppDbContext db) { _db = db; }

    private static string? UID(ClaimsPrincipal u) =>
        u.FindFirst("sub")?.Value ?? u.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    // GET /api/my/bids
    [HttpGet("~/api/my/bids")]
    public async Task<IActionResult> MyBids(CancellationToken ct = default)
    {
        var uid = UID(User);
        if (uid is null) return Unauthorized();

        var rows = await _db.Bids.AsNoTracking()
            .Where(b => b.BidderId == uid)
            .OrderByDescending(b => b.Id)
            .Include(b => b.Auction)
            .Select(b => new {
                id = b.Id,
                amount = b.Amount,
                at = b.CreatedAtUtc,
                auctionId = b.AuctionId,
                auctionTitle = b.Auction.Title
            }).ToListAsync(ct);

        return Ok(rows);
    }
}
