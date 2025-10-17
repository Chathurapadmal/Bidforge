// Controllers/AuctionsController.cs
using Microsoft.AspNetCore.Authorization;
// ...other usings already present...

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuctionsController(AppDbContext db) => _db = db;

    // 🔽 ADD THIS: LIST ENDPOINT used by /src/app/buy/page.tsx
    // GET /api/auctions?q=&min=&max=&status=all|open|closed&badge=&sort=latest|ending|price_asc|price_desc&limit=100
    [HttpGet]
    [AllowAnonymous] // keep public; remove if you want it protected
    public async Task<IActionResult> List(
        [FromQuery] string? q,
        [FromQuery] decimal? min,
        [FromQuery] decimal? max,
        [FromQuery] string? status = "all",
        [FromQuery] string? badge = null,
        [FromQuery] string? sort = "latest",
        [FromQuery] int limit = 100)
    {
        limit = Math.Clamp(limit, 1, 200);

        var now = DateTime.UtcNow;
        var query = _db.Auctions.AsNoTracking().AsQueryable();

        // text search
        if (!string.IsNullOrWhiteSpace(q))
        {
            var s = q.Trim();
            query = query.Where(a =>
                (a.Title != null && a.Title.Contains(s)) ||
                (a.Description != null && a.Description.Contains(s)));
        }

        // price range (uses CurrentBid)
        if (min.HasValue) query = query.Where(a => a.CurrentBid >= min.Value);
        if (max.HasValue) query = query.Where(a => a.CurrentBid <= max.Value);

        // status
        switch ((status ?? "all").Trim().ToLowerInvariant())
        {
            case "open":
                query = query.Where(a => a.EndTime == null || a.EndTime > now);
                break;
            case "closed":
                query = query.Where(a => a.EndTime != null && a.EndTime <= now);
                break;
            case "all":
            default:
                break;
        }

        // badge filter
        if (!string.IsNullOrWhiteSpace(badge))
        {
            var b = badge.Trim();
            query = query.Where(a => a.Badge != null && a.Badge == b);
        }

        // sorting
        query = (sort ?? "latest").ToLowerInvariant() switch
        {
            "ending" => query.OrderBy(a => a.EndTime ?? DateTime.MaxValue),
            "price_asc" => query.OrderBy(a => a.CurrentBid).ThenByDescending(a => a.CreatedAt),
            "price_desc" => query.OrderByDescending(a => a.CurrentBid).ThenByDescending(a => a.CreatedAt),
            _ => query.OrderByDescending(a => a.CreatedAt) // latest
        };

        // materialize minimal fields including ImagesJson so we can pick a preview image
        var raw = await query
            .Take(limit)
            .Select(a => new
            {
                a.Id,
                a.Title,
                a.Description,
                a.Image,        // legacy single image file name
                a.ImagesJson,   // JSON array of image names/paths
                a.CurrentBid,
                a.EndTime,
                a.Badge,
                a.CreatedAt
            })
            .ToListAsync();

        // choose the primary image: first from ImagesJson, else Image, else null
        var items = raw.Select(a =>
        {
            string? primary = a.Image;
            if (string.IsNullOrWhiteSpace(primary) && !string.IsNullOrWhiteSpace(a.ImagesJson))
            {
                try
                {
                    var arr = System.Text.Json.JsonSerializer.Deserialize<string[]>(a.ImagesJson!) ?? Array.Empty<string>();
                    primary = arr.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s));
                }
                catch { /* ignore bad json */ }
            }

            return new
            {
                id = a.Id,
                title = a.Title,
                description = a.Description,
                image = primary,          // frontend’s toImageSrc() will turn this into a URL
                currentBid = a.CurrentBid,
                endTime = a.EndTime,
                badge = a.Badge,
                createdAt = a.CreatedAt
            };
        }).ToList();

        return Ok(new { items });
    }

    // (keep your existing GetAuction, GetBids, PlaceBid methods below)
}
