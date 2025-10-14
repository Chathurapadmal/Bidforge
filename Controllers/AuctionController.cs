using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/auctions")]
public class AuctionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuctionsController(AppDbContext db) => _db = db;

    // ---------- DTO ----------
    public class AuctionDto
    {
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public string? Image { get; set; } // primary
        public List<string>? Images { get; set; }
        public decimal? CurrentBid { get; set; }
        public DateTimeOffset? EndTime { get; set; }
        public string? Badge { get; set; }
    }

    // ---------- GET all ----------
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] int limit = 100, [FromQuery] string? sort = "latest")
    {
        limit = Math.Clamp(limit, 1, 200);

        IQueryable<Auction> q = _db.Auctions.AsNoTracking();

        q = sort?.ToLowerInvariant() switch
        {
            "latest" => q.OrderByDescending(a => a.CreatedAt),
            "ending" => q.OrderBy(a => a.EndTime ?? DateTime.MaxValue),
            _ => q.OrderByDescending(a => a.CreatedAt)
        };

        var items = await q.Take(limit).ToListAsync();
        var total = await _db.Auctions.CountAsync();

        return Ok(new { items, total });
    }

    // ---------- GET by ID ----------
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var a = await _db.Auctions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        return a is null ? NotFound() : Ok(a);
    }

    // ---------- CREATE ----------
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AuctionDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Title is required." });

        var primary = dto.Images?.FirstOrDefault() ?? dto.Image;

        var a = new Auction
        {
            Title = dto.Title.Trim(),
            Description = dto.Description,
            Image = primary,
            CurrentBid = dto.CurrentBid ?? 0,
            EndTime = dto.EndTime?.UtcDateTime,
            Badge = dto.Badge,
            CreatedAt = DateTime.UtcNow
        };

        _db.Auctions.Add(a);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = a.Id }, a);
    }

    // ---------- UPDATE ----------
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] AuctionDto dto)
    {
        var a = await _db.Auctions.FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();

        a.Title = string.IsNullOrWhiteSpace(dto.Title) ? a.Title : dto.Title.Trim();
        a.Description = dto.Description;
        a.Image = dto.Images?.FirstOrDefault() ?? dto.Image ?? a.Image;
        a.CurrentBid = dto.CurrentBid ?? a.CurrentBid;
        a.EndTime = dto.EndTime?.UtcDateTime ?? a.EndTime;
        a.Badge = dto.Badge ?? a.Badge;

        await _db.SaveChangesAsync();
        return Ok(a);
    }

    // ---------- DELETE ----------
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var a = await _db.Auctions.FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();

        _db.Auctions.Remove(a);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
