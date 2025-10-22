// File: Controllers/ProfileController.cs
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    public ProfileController(AppDbContext db, IWebHostEnvironment env) { _db = db; _env = env; }

    private static string? UID(ClaimsPrincipal u) =>
        u.FindFirst("sub")?.Value ?? u.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct = default)
    {
        var id = UID(User);
        if (id is null) return Unauthorized();

        var u = await _db.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (u is null) return NotFound();

        return Ok(new { id = u.Id, email = u.Email, name = u.DisplayName ?? u.Email, avatarUrl = u.AvatarUrl });
    }

    public class UpdateDto { [MaxLength(100)] public string? Name { get; set; } }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateDto dto, CancellationToken ct = default)
    {
        var id = UID(User);
        if (id is null) return Unauthorized();

        var u = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (u is null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Name))
            u.DisplayName = dto.Name!.Trim();

        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true, name = u.DisplayName ?? u.Email });
    }

    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar([FromForm] IFormFile file, CancellationToken ct = default)
    {
        var id = UID(User);
        if (id is null) return Unauthorized();
        if (file is null || file.Length == 0) return BadRequest(new { message = "No file." });

        var dir = Path.Combine(_env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot"), "uploads", "avatars");
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(file.FileName);
        var name = $"{id}_{Guid.NewGuid():N}{ext}";
        var full = Path.Combine(dir, name);
        await using (var fs = System.IO.File.Create(full))
            await file.CopyToAsync(fs, ct);

        var rel = $"/uploads/avatars/{name}";

        var u = await _db.Users.FirstAsync(x => x.Id == id, ct);
        u.AvatarUrl = rel;
        await _db.SaveChangesAsync(ct);

        return Ok(new { ok = true, avatarUrl = rel });
    }
}
