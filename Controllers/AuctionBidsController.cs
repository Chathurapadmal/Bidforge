using System.Reflection;
using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Produces("application/json")]
[Route("api/auctions/{auctionId:int}/bids")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class AuctionBidsController(AppDbContext db) : ControllerBase
{
    private const decimal MinIncrement = 100m; // keep in sync with frontend

    // ---- helpers ----
    static string? FirstNonEmpty(params string?[] vals) =>
        vals.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));

    static bool TrySetProp(object target, string name, object? value)
    {
        var p = target.GetType().GetProperty(name, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
        if (p == null || !p.CanWrite) return false;
        try
        {
            var tt = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
            object? coerced = value == null ? null : (tt.IsInstanceOfType(value) ? value : Convert.ChangeType(value, tt));
            p.SetValue(target, coerced);
            return true;
        }
        catch { return false; }
    }

    // GET /api/auctions/{auctionId}/bids?limit=50
    [HttpGet]
    public async Task<IActionResult> Get(int auctionId, [FromQuery] int? limit = 50)
    {
        if (!await db.Auctions.AnyAsync(a => a.Id == auctionId))
            return NotFound(new { message = "Auction not found." });

        var take = Math.Clamp(limit ?? 50, 1, 200);

        // read minimal bid data; user id is optional (via EF.Property so it compiles even if Bid has no UserId)
        var raw = await db.Bids
            .AsNoTracking()
            .Where(b => b.AuctionId == auctionId)
            .OrderByDescending(b => b.CreatedAt)
            .Take(take)
            .Select(b => new
            {
                id = b.Id,
                amount = b.Amount,
                createdAt = b.CreatedAt,
                userId = EF.Property<string?>(b, "UserId")
            })
            .ToListAsync();

        // resolve display names for any userIds
        var userIds = raw.Select(r => r.userId).Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().ToList();
        var usersById = userIds.Count == 0
            ? new Dictionary<string, ApplicationUser>()
            : await db.Users.Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id, u => u);

        var items = raw.Select(r =>
        {
            string? bidder = null;
            if (!string.IsNullOrWhiteSpace(r.userId) && usersById.TryGetValue(r.userId!, out var u))
                bidder = FirstNonEmpty(u.FullName, u.UserName, u.Email);

            return new
            {
                id = r.id,
                amount = r.amount,
                bidderId = r.userId,
                bidder, // frontend shows "Guest" if null
                createdAt = r.createdAt.ToString("o")
            };
        }).ToList();

        return Ok(new { items });
    }

    public record PlaceBidDto(decimal Amount);

    // POST /api/auctions/{auctionId}/bids
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

        // base is CurrentBid only (since your model has no StartingPrice)
        var minNext = Math.Max(auction.CurrentBid, 0m) + MinIncrement;
        if (dto.Amount < minNext)
            return BadRequest(new { message = $"Minimum next bid is {minNext}." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { message = "Unauthorized" });

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        var displayName = FirstNonEmpty(user?.FullName, user?.UserName, user?.Email) ?? "Guest";

        // create bid (no need for Bidder string on entity)
        var bid = new Bid
        {
            AuctionId = auctionId,
            Amount = dto.Amount,
            CreatedAt = now
        };

        // set whichever FK your Bid actually uses (safe attempts)
        var linked =
               TrySetProp(bid, "UserId", userId)
            || TrySetProp(bid, "ApplicationUserId", userId)
            || TrySetProp(bid, "BidderId", userId)
            || TrySetProp(bid, "User_Id", userId);

        db.Bids.Add(bid);

        // update current price
        auction.CurrentBid = dto.Amount;

        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(Get), new { auctionId }, new
        {
            id = bid.Id,
            amount = bid.Amount,
            bidderId = linked ? userId : null,
            bidder = displayName,
            createdAt = bid.CreatedAt.ToString("o")
        });
    }
}
