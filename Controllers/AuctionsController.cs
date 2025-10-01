using Bidforge.Data;
using Bidforge.DTOs;
using Bidforge.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuctionsController(AppDbContext db) => _db = db;

    // --- helper: normalize to a public URL the frontend can render ---
    private static string? ToPublicImage(string? image)
    {
        if (string.IsNullOrWhiteSpace(image)) return null;

        var val = image.Trim();

        // Already a web URL?
        if (val.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            val.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
            val.StartsWith("//"))
        {
            return val;
        }

        // Already a public /images path?
        if (val.StartsWith("/images/", StringComparison.OrdinalIgnoreCase))
        {
            return val;
        }

        // If it's a Windows or Unix file path or just "filename.jpg",
        // convert to /images/<filename>
        var fileName = System.IO.Path.GetFileName(val);
        if (string.IsNullOrWhiteSpace(fileName))
            return null;

        return "/images/" + fileName;
    }

    [HttpGet]
    public async Task<IActionResult> GetMany([FromQuery] string? sort, [FromQuery] int limit = 50, [FromQuery] int page = 1)
    {
        if (limit <= 0 || limit > 100) limit = 50;
        if (page <= 0) page = 1;

        var q = _db.Auctions.AsNoTracking().AsQueryable();

        q = sort switch
        {
            "endingSoon" => q.OrderBy(a => a.EndTime ?? DateTime.MaxValue),
            "latest" => q.OrderByDescending(a => a.CreatedAt),
            _ => q.OrderByDescending(a => a.CreatedAt)
        };

        var total = await q.CountAsync();
        var rawItems = await q.Skip((page - 1) * limit).Take(limit).ToListAsync();

        // normalize image for output
        foreach (var a in rawItems)
        {
            a.Image = ToPublicImage(a.Image);
        }

        return Ok(new { total, page, limit, items = rawItems });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var a = await _db.Auctions.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();

        a.Image = ToPublicImage(a.Image);
        return Ok(a);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAuctionRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var a = new Auction
        {
            Title = req.Title,
            Description = req.Description,
            Image = ToPublicImage(req.Image), // normalize on write
            CurrentBid = req.CurrentBid,
            EndTime = req.EndTime,
            Badge = req.Badge,
            CreatedAt = DateTime.UtcNow
        };

        _db.Auctions.Add(a);
        await _db.SaveChangesAsync();

        // ensure response is normalized too
        a.Image = ToPublicImage(a.Image);
        return CreatedAtAction(nameof(GetById), new { id = a.Id }, a);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateAuctionRequest req)
    {
        var a = await _db.Auctions.FirstOrDefaultAsync(x => x.Id == id);
        if (a is null) return NotFound();

        if (req.Title != null) a.Title = req.Title;
        if (req.Description != null) a.Description = req.Description;
        if (req.Image != null) a.Image = ToPublicImage(req.Image); // normalize on write
        if (req.CurrentBid.HasValue) a.CurrentBid = req.CurrentBid.Value;
        if (req.EndTime.HasValue) a.EndTime = req.EndTime;
        if (req.Badge != null) a.Badge = req.Badge;

        await _db.SaveChangesAsync();

        // normalize response
        a.Image = ToPublicImage(a.Image);
        return Ok(a);
    }

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
