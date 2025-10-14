// Controllers/AuctionsController.cs  (name can be anything, but route must match)
using Bidforge.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/auctions")] // <-- force plural route (critical)
public class AuctionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuctionsController(AppDbContext db) => _db = db;

    // GET /api/auctions?sort=latest&limit=100 ...
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] string? q,
        [FromQuery] string? min,
        [FromQuery] string? max,
        [FromQuery] string? status = "all",
        [FromQuery] string? badge = null,
        [FromQuery] string? sort = "latest",
        [FromQuery] int? limit = 100)
    {
        var now = DateTime.UtcNow;
        var query = _db.Auctions.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var k = q.Trim();
            query = query.Where(a => a.Title.Contains(k) ||
                                     (a.Description != null && a.Description.Contains(k)));
        }

        if (decimal.TryParse(min, out var minVal)) query = query.Where(a => a.CurrentBid >= minVal);
        if (decimal.TryParse(max, out var maxVal)) query = query.Where(a => a.CurrentBid <= maxVal);

        if (!string.IsNullOrWhiteSpace(badge))
        {
            var b = badge.Trim();
            query = query.Where(a => a.Badge != null && a.Badge.Equals(b, StringComparison.OrdinalIgnoreCase));
        }

        status = (status ?? "all").ToLowerInvariant();
        if (status == "open") query = query.Where(a => a.EndTime == null || a.EndTime > now);
        if (status == "closed") query = query.Where(a => a.EndTime != null && a.EndTime <= now);

        query = (sort ?? "latest").ToLowerInvariant() switch
        {
            "price_asc" => query.OrderBy(a => a.CurrentBid).ThenByDescending(a => a.CreatedAt),
            "price_desc" => query.OrderByDescending(a => a.CurrentBid).ThenByDescending(a => a.CreatedAt),
            "ending_soon" => query.OrderBy(a => a.EndTime ?? DateTime.MaxValue).ThenByDescending(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt),
        };

        var take = Math.Clamp(limit ?? 100, 1, 200);
        var rows = await query.Take(take).ToListAsync();

        var items = rows.Select(a => new {
            id = a.Id,
            title = a.Title,
            description = a.Description,
            image = NormalizeImage(a.Image),
            images = a.GetImages().Select(NormalizeImage).ToArray(),
            currentBid = a.CurrentBid,
            endTime = a.EndTime?.ToString("o"),
            badge = a.Badge,
            createdAt = a.CreatedAt.ToString("o")
        });

        var total = await _db.Auctions.CountAsync();
        return Ok(new { items, total });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var a = await _db.Auctions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (a == null) return NotFound();

        string NormalizeImage(string? s)
        {
            if (string.IsNullOrWhiteSpace(s)) return null!;
            s = s.Trim();
            if (s.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                s.StartsWith("https://", StringComparison.OrdinalIgnoreCase)) return s;
            if (s.StartsWith("/images/", StringComparison.OrdinalIgnoreCase)) return s;
            if (s.StartsWith("images/", StringComparison.OrdinalIgnoreCase)) return "/" + s;
            return "/images/" + Uri.EscapeDataString(s);
        }

        return Ok(new
        {
            id = a.Id,
            title = a.Title,
            description = a.Description,
            image = NormalizeImage(a.Image),
            images = a.GetImages().Select(NormalizeImage).ToArray(),
            currentBid = a.CurrentBid,
            endTime = a.EndTime?.ToString("o"),
            badge = a.Badge,
            createdAt = a.CreatedAt.ToString("o"),
        });
    }

    private static string? NormalizeImage(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        s = s.Trim();
        if (s.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            s.StartsWith("https://", StringComparison.OrdinalIgnoreCase)) return s;
        if (s.StartsWith("/images/", StringComparison.OrdinalIgnoreCase)) return s;
        if (s.StartsWith("images/", StringComparison.OrdinalIgnoreCase)) return "/" + s;
        return "/images/" + Uri.EscapeDataString(s);
    }
}
