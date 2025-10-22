using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Authorize]
public class KycController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    public KycController(AppDbContext db, IWebHostEnvironment env) { _db = db; _env = env; }

    private static string? UID(ClaimsPrincipal u) =>
        u.FindFirst("sub")?.Value ?? u.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private string Root() => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

    [HttpGet("~/api/kyc")]
    public async Task<IActionResult> GetMine(CancellationToken ct = default)
    {
        var uid = UID(User); if (uid is null) return Unauthorized();
        var u = await _db.Users.AsNoTracking().FirstAsync(x => x.Id == uid, ct);
        return Ok(new
        {
            status = u.KycStatus,
            nic = u.NicImageUrl,
            selfie = u.SelfieImageUrl,
            reviewedAt = u.KycReviewedAtUtc
        });
    }

    [HttpPost("~/api/kyc/nic")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadNic([FromForm] IFormFile file, CancellationToken ct = default)
    {
        var uid = UID(User); if (uid is null) return Unauthorized();
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file" });

        var dir = Path.Combine(Root(), "uploads", "kyc");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        var name = $"{uid}_nic_{Guid.NewGuid():N}{ext}";
        var full = Path.Combine(dir, name);
        await using (var fs = System.IO.File.Create(full)) await file.CopyToAsync(fs, ct);
        var rel = $"/uploads/kyc/{name}";

        var u = await _db.Users.FirstAsync(x => x.Id == uid, ct);
        u.NicImageUrl = rel;
        u.KycStatus = u.SelfieImageUrl is null ? "pending" : "pending";
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true, url = rel });
    }

    [HttpPost("~/api/kyc/selfie")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadSelfie([FromForm] IFormFile file, CancellationToken ct = default)
    {
        var uid = UID(User); if (uid is null) return Unauthorized();
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file" });

        var dir = Path.Combine(Root(), "uploads", "kyc");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        var name = $"{uid}_selfie_{Guid.NewGuid():N}{ext}";
        var full = Path.Combine(dir, name);
        await using (var fs = System.IO.File.Create(full)) await file.CopyToAsync(fs, ct);
        var rel = $"/uploads/kyc/{name}";

        var u = await _db.Users.FirstAsync(x => x.Id == uid, ct);
        u.SelfieImageUrl = rel;
        if (!string.Equals(u.KycStatus, "approved", StringComparison.OrdinalIgnoreCase))
            u.KycStatus = "pending";
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true, url = rel });
    }

    // --- Admin review ---
    [HttpGet("~/api/admin/kyc/pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ListPending(CancellationToken ct = default)
    {
        var list = await _db.Users.AsNoTracking()
            .Where(u => u.KycStatus == "pending")
            .Select(u => new {
                id = u.Id,
                email = u.Email,
                name = u.DisplayName,
                nic = u.NicImageUrl,
                selfie = u.SelfieImageUrl
            }).ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("~/api/admin/kyc/approve/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(string userId, CancellationToken ct = default)
    {
        var reviewer = UID(User) ?? "admin";
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) return NotFound();
        u.KycStatus = "approved";
        u.KycReviewedAtUtc = DateTime.UtcNow;
        u.KycReviewerId = reviewer;
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }

    [HttpPost("~/api/admin/kyc/reject/{userId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(string userId, CancellationToken ct = default)
    {
        var reviewer = UID(User) ?? "admin";
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) return NotFound();
        u.KycStatus = "rejected";
        u.KycReviewedAtUtc = DateTime.UtcNow;
        u.KycReviewerId = reviewer;
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }
}
