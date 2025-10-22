using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<AuctionsController> _log;

    public AuctionsController(AppDbContext db, IWebHostEnvironment env, ILogger<AuctionsController> log)
    { _db = db; _env = env; _log = log; }

    // ---------- DTO ----------
    public sealed class CreateAuctionDto
    {
        [Required] public string Title { get; set; } = default!;
        public string? Description { get; set; }
        [Range(0, double.MaxValue)] public decimal StartingBid { get; set; } = 0m;
        [Required] public DateTime EndTimeUtc { get; set; }
        public string? Badge { get; set; }
        public IFormFile? Image { get; set; }
    }

    public sealed class PlaceBidDto
    {
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }
    }

    // ---------- helpers ----------
    private static DateTime AsUtc(DateTime t) =>
        t.Kind == DateTimeKind.Utc ? t : DateTime.SpecifyKind(t, DateTimeKind.Utc);

    private string WebRoot() => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

    private async Task<string?> SaveImageAsync(IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return null;

        var dir = Path.Combine(WebRoot(), "uploads", "auctions");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        var name = $"{Guid.NewGuid()}{ext}";
        var full = Path.Combine(dir, name);

        await using (var fs = System.IO.File.Create(full))
            await file.CopyToAsync(fs, ct);

        var webPath = $"/uploads/auctions/{name}";
        _log.LogInformation("Saved image: disk='{Full}' web='{Web}'", full, webPath);
        return webPath;
    }

    private static string? GetUserId(ClaimsPrincipal user) =>
        user.FindFirstValue("sub") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);

    // ---------- LIST (public) ----------
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> List([FromQuery] string? sort = "endingSoon",
                                          [FromQuery] int page = 1,
                                          [FromQuery] int limit = 12,
                                          CancellationToken ct = default)
    {
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 12;

        IQueryable<Auction> q = _db.Auctions.AsNoTracking();

        switch ((sort ?? "endingSoon").Trim().ToLowerInvariant())
        {
            case "endingsoon": q = q.OrderBy(a => a.EndTimeUtc); break;
            case "newest": q = q.OrderByDescending(a => a.CreatedAtUtc).ThenByDescending(a => a.Id); break;
            case "priceasc": q = q.OrderBy(a => a.CurrentBid); break;
            case "pricedesc": q = q.OrderByDescending(a => a.CurrentBid); break;
            default: q = q.OrderBy(a => a.EndTimeUtc); break;
        }

        var total = await q.CountAsync(ct);
        var items = await q.Skip((page - 1) * limit).Take(limit)
                           .Select(a => new {
                               id = a.Id,
                               title = a.Title,
                               currentBid = a.CurrentBid,
                               startTime = a.CreatedAtUtc,
                               endTime = a.EndTimeUtc,
                               image = a.Image,
                               badge = a.Badge
                           })
                           .ToListAsync(ct);

        return Ok(new { page, pageSize = limit, total, items });
    }

    // ---------- DETAIL (public) ----------
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetOne(int id, CancellationToken ct = default)
    {
        var a = await _db.Auctions
            .AsNoTracking()
            .Include(x => x.Bids).ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (a is null) return NotFound(new { message = "Auction not found" });

        var topBid = a.Bids.OrderByDescending(b => b.Amount).ThenByDescending(b => b.Id).FirstOrDefault();
        var topName = topBid?.Bidder?.DisplayName ?? topBid?.Bidder?.Email;

        return Ok(new
        {
            id = a.Id,
            title = a.Title,
            description = a.Description,
            currentBid = a.CurrentBid,
            startTime = a.CreatedAtUtc,
            endTime = a.EndTimeUtc,
            image = a.Image,
            badge = a.Badge,
            sellerId = a.SellerId,
            topBid = topBid is null ? null : new
            {
                amount = topBid.Amount,
                at = topBid.CreatedAtUtc,
                bidderId = topBid.BidderId,
                bidderName = topName
            },
            isEnded = DateTime.UtcNow >= a.EndTimeUtc,
            purchasedAt = a.PurchasedAtUtc
        });
    }

    // ---------- STATUS (public) ----------
    // Lightweight status for polling: top bidder + ended + canPurchase for current user
    [HttpGet("{id:int}/status")]
    [AllowAnonymous]
    public async Task<IActionResult> Status(int id, CancellationToken ct = default)
    {
        var a = await _db.Auctions
            .AsNoTracking()
            .Include(x => x.Bids).ThenInclude(b => b.Bidder)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (a is null) return NotFound(new { message = "Auction not found" });

        var topBid = a.Bids.OrderByDescending(b => b.Amount).ThenByDescending(b => b.Id).FirstOrDefault();
        var topName = topBid?.Bidder?.DisplayName ?? topBid?.Bidder?.Email;
        var now = DateTime.UtcNow;
        var userId = GetUserId(User);

        var isEnded = now >= a.EndTimeUtc;
        var isWinner = (userId is not null) && (topBid?.BidderId == userId);
        var canPurchase = isEnded && isWinner && a.PurchasedAtUtc is null;

        return Ok(new
        {
            currentBid = a.CurrentBid,
            topBid = topBid is null ? null : new
            {
                amount = topBid.Amount,
                bidderId = topBid.BidderId,
                bidderName = topName
            },
            isEnded,
            canPurchase,
            purchasedAt = a.PurchasedAtUtc
        });
    }

    // ---------- BIDS LIST (public) ----------
    [HttpGet("{id:int}/bids")]
    [AllowAnonymous]
    public async Task<IActionResult> GetBids(int id, CancellationToken ct = default)
    {
        var exists = await _db.Auctions.AsNoTracking().AnyAsync(x => x.Id == id, ct);
        if (!exists) return NotFound(new { message = "Auction not found" });

        var bids = await _db.Bids
            .AsNoTracking()
            .Where(b => b.AuctionId == id)
            .OrderByDescending(b => b.Amount).ThenByDescending(b => b.Id)
            .Include(b => b.Bidder)
            .Select(b => new {
                id = b.Id,
                amount = b.Amount,
                at = b.CreatedAtUtc,
                bidderId = b.BidderId,
                bidderName = b.Bidder!.DisplayName ?? b.Bidder!.Email
            })
            .ToListAsync(ct);

        return Ok(bids);
    }

    // ---------- PLACE BID (auth) ----------
    [HttpPost("{id:int}/bids")]
    [Authorize]
    public async Task<IActionResult> PlaceBid(int id, [FromBody] PlaceBidDto dto, CancellationToken ct = default)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId(User);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var a = await _db.Auctions
            .Include(x => x.Bids)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (a is null) return NotFound(new { message = "Auction not found" });

        var now = DateTime.UtcNow;
        if (now >= a.EndTimeUtc) return BadRequest(new { message = "Auction already ended." });

        var currentTop = a.Bids.OrderByDescending(b => b.Amount).ThenByDescending(b => b.Id).FirstOrDefault()?.Amount
                         ?? a.CurrentBid;

        // Simple rule: new bid must be > currentTop by any positive amount
        if (dto.Amount <= currentTop)
            return BadRequest(new { message = $"Bid must be greater than {currentTop:0.00}" });

        _db.Bids.Add(new Bid
        {
            AuctionId = a.Id,
            Amount = dto.Amount,
            BidderId = userId,
            CreatedAtUtc = now
        });

        a.CurrentBid = dto.Amount; // keep current price in auction row

        await _db.SaveChangesAsync(ct);

        return Ok(new { ok = true, currentBid = a.CurrentBid });
    }

    // ---------- PURCHASE (auth; only winner after end; one-time) ----------
    [HttpPost("{id:int}/purchase")]
    [Authorize]
    public async Task<IActionResult> Purchase(int id, CancellationToken ct = default)
    {
        var userId = GetUserId(User);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var a = await _db.Auctions
            .Include(x => x.Bids)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (a is null) return NotFound(new { message = "Auction not found" });

        var now = DateTime.UtcNow;
        if (now < a.EndTimeUtc) return BadRequest(new { message = "Auction not ended yet." });
        if (a.PurchasedAtUtc is not null) return BadRequest(new { message = "Already purchased." });

        var topBid = a.Bids.OrderByDescending(b => b.Amount).ThenByDescending(b => b.Id).FirstOrDefault();
        if (topBid is null) return BadRequest(new { message = "No bids were placed." });
        if (topBid.BidderId != userId) return Forbid();

        a.WinnerId = userId;
        a.PurchasedAtUtc = now;
        await _db.SaveChangesAsync(ct);

        // In a real app, create Order/PaymentIntent here

        return Ok(new { ok = true, purchasedAt = a.PurchasedAtUtc });
    }

    // ---------- MINE (auth) ----------
    [HttpGet("~/api/my/auctions")]
    [Authorize]
    public async Task<IActionResult> MyAuctions(CancellationToken ct = default)
    {
        var userId = GetUserId(User);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var items = await _db.Auctions.AsNoTracking()
            .Where(a => a.SellerId == userId)
            .OrderByDescending(a => a.Id)
            .Select(a => new {
                id = a.Id,
                title = a.Title,
                currentBid = a.CurrentBid,
                endTime = a.EndTimeUtc,
                image = a.Image,
                badge = a.Badge
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    // ---------- CREATE ----------
    [HttpPost]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] CreateAuctionDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var userId = GetUserId(User);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var now = DateTime.UtcNow;
        var endUtc = AsUtc(dto.EndTimeUtc);
        if (endUtc <= now) return BadRequest(new { message = "EndTimeUtc must be in the future (UTC)." });

        var imgPath = await SaveImageAsync(dto.Image, ct);

        var a = new Auction
        {
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            CurrentBid = dto.StartingBid,
            EndTimeUtc = endUtc,
            Badge = string.IsNullOrWhiteSpace(dto.Badge) ? null : dto.Badge.Trim(),
            Image = imgPath,
            CreatedAtUtc = now,
            SellerId = userId
        };

        _db.Auctions.Add(a);
        await _db.SaveChangesAsync(ct);

        return Ok(new { id = a.Id });
    }

    // ---------- DELETE ----------
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        var userId = GetUserId(User);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var a = await _db.Auctions.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (a is null) return NotFound(new { message = "Auction not found" });
        if (!string.Equals(a.SellerId, userId, StringComparison.Ordinal))
            return Forbid();

        if (!string.IsNullOrEmpty(a.Image) && a.Image.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase))
        {
            var full = Path.Combine(WebRoot(), a.Image.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            try { if (System.IO.File.Exists(full)) System.IO.File.Delete(full); }
            catch (Exception ex) { _log.LogWarning(ex, "Failed to delete image {Full}", full); }
        }

        _db.Auctions.Remove(a);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    // Preflight
    [HttpOptions]
    [AllowAnonymous]
    public IActionResult Options() => Ok();
}
