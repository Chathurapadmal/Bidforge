// File: Controllers/KycController.cs
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/kyc")]
public class KycController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<KycController> _log;

    public KycController(AppDbContext db, IWebHostEnvironment env, ILogger<KycController> log)
    { _db = db; _env = env; _log = log; }

    private string WebRoot() => _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");

    private async Task<string?> SaveImageAsync(IFormFile? file, string subdir, CancellationToken ct)
    {
        if (file is null || file.Length == 0) return null;
        var dir = Path.Combine(WebRoot(), "uploads", subdir);
        Directory.CreateDirectory(dir);
        var ext = Path.GetExtension(file.FileName);
        var name = $"{Guid.NewGuid()}{ext}";
        var full = Path.Combine(dir, name);
        await using (var fs = System.IO.File.Create(full))
            await file.CopyToAsync(fs, ct);
        var webPath = $"/uploads/{subdir}/{name}";
        _log.LogInformation("Saved KYC image: {Full} -> {Web}", full, webPath);
        return webPath;
    }

    private static string? UserId(ClaimsPrincipal u) =>
        u.FindFirstValue("sub") ?? u.FindFirstValue(ClaimTypes.NameIdentifier);

    // ----------- Me (read) -----------
    // GET /api/kyc/me
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyKyc(CancellationToken ct)
    {
        var uid = UserId(User);
        if (uid is null) return Unauthorized();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == uid, ct);
        if (user is null) return Unauthorized();

        return Ok(new
        {
            status = user.KycStatus ?? "none",
            nic = user.NicImageUrl,
            selfie = user.SelfieImageUrl,
            reviewedAt = (string?)null // add if you track review timestamps
        });
    }

    // ----------- Upload NIC -----------
    // Accept either field name "Nic" OR generic "file"
    [HttpPost("nic")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadNic(
        [FromForm(Name = "Nic")] IFormFile? nic,
        [FromForm(Name = "file")] IFormFile? file,
        CancellationToken ct)
    {
        var uid = UserId(User);
        if (uid is null) return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == uid, ct);
        if (user is null) return Unauthorized();

        var chosen = nic ?? file; // accept either key
        if (chosen is null) return BadRequest(new { message = "No NIC file uploaded." });

        var path = await SaveImageAsync(chosen, "kyc", ct);
        if (path is null) return BadRequest(new { message = "No NIC file uploaded." });

        user.NicImageUrl = path;
        user.KycStatus = "pending";
        await _db.SaveChangesAsync(ct);

        return Ok(new { ok = true, nic = user.NicImageUrl, status = user.KycStatus });
    }

    // ----------- Upload Selfie -----------
    // Accept either field name "Selfie" OR generic "file"
    [HttpPost("selfie")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadSelfie(
        [FromForm(Name = "Selfie")] IFormFile? selfie,
        [FromForm(Name = "file")] IFormFile? file,
        CancellationToken ct)
    {
        var uid = UserId(User);
        if (uid is null) return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == uid, ct);
        if (user is null) return Unauthorized();

        var chosen = selfie ?? file; // accept either key
        if (chosen is null) return BadRequest(new { message = "No selfie file uploaded." });

        var path = await SaveImageAsync(chosen, "kyc", ct);
        if (path is null) return BadRequest(new { message = "No selfie file uploaded." });

        user.SelfieImageUrl = path;
        user.KycStatus = "pending";
        await _db.SaveChangesAsync(ct);

        return Ok(new { ok = true, selfie = user.SelfieImageUrl, status = user.KycStatus });
    }
}

// ------------- ADMIN -------------
[ApiController]
[Route("api/admin/kyc")]
[Authorize(Roles = "Admin")]
public class AdminKycController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminKycController(AppDbContext db) { _db = db; }

    // GET /api/admin/kyc/pending
    [HttpGet("pending")]
    public async Task<IActionResult> Pending(CancellationToken ct)
    {
        var list = await _db.Users.AsNoTracking()
            .Where(u => (u.KycStatus ?? "none") == "pending")
            .OrderBy(u => u.Email)
            .Select(u => new
            {
                id = u.Id,
                email = u.Email,
                name = u.DisplayName ?? u.Email,
                nic = u.NicImageUrl,
                selfie = u.SelfieImageUrl
            })
            .ToListAsync(ct);

        return Ok(list);
    }

    // POST /api/admin/kyc/approve/{userId}
    [HttpPost("approve/{userId}")]
    public async Task<IActionResult> Approve(string userId, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) return NotFound();
        u.KycStatus = "approved";
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }

    // POST /api/admin/kyc/reject/{userId}
    [HttpPost("reject/{userId}")]
    public async Task<IActionResult> Reject(string userId, CancellationToken ct)
    {
        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == userId, ct);
        if (u is null) return NotFound();
        u.KycStatus = "rejected";
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }
}
