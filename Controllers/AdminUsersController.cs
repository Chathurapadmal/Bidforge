// File: Controllers/AdminUsersController.cs
using System.ComponentModel.DataAnnotations;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<ApplicationUser> _users;
    private readonly IWebHostEnvironment _env;

    public AdminUsersController(AppDbContext db, UserManager<ApplicationUser> users, IWebHostEnvironment env)
    { _db = db; _users = users; _env = env; }

    // GET /api/admin/users?query=&kyc=pending|approved|rejected|none
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? query, [FromQuery] string? kyc, CancellationToken ct)
    {
        var q = _db.Users.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLowerInvariant();
            q = q.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                (u.DisplayName != null && u.DisplayName.ToLower().Contains(term)) ||
                u.Id.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(kyc))
        {
            var k = kyc.Trim().ToLowerInvariant();
            q = q.Where(u => (u.KycStatus ?? "none").ToLower() == k);
        }

        var users = await q
            .OrderBy(u => u.Email)
            .ToListAsync(ct);

        // load roles per user
        var result = new List<object>(users.Count);
        foreach (var u in users)
        {
            var roles = await _users.GetRolesAsync(u);
            result.Add(new
            {
                id = u.Id,
                email = u.Email,
                name = u.DisplayName ?? u.Email,
                emailConfirmed = u.EmailConfirmed,
                roles,
                kycStatus = u.KycStatus ?? "none",
                nic = u.NicImageUrl,
                selfie = u.SelfieImageUrl,
                avatar = u.AvatarUrl
            });
        }

        return Ok(result);
    }

    // DELETE /api/admin/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user is null) return NotFound();

        // remove files (avatar + kyc)
        TryDeleteFile(user.AvatarUrl);
        TryDeleteFile(user.NicImageUrl);
        TryDeleteFile(user.SelfieImageUrl);

        // cascade deletes for foreign keys (Auction SellerId, Bids, etc.) rely on your FK rules
        await _users.DeleteAsync(user);
        return NoContent();
    }

    private void TryDeleteFile(string? rel)
    {
        if (string.IsNullOrWhiteSpace(rel)) return;
        if (!rel.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase)) return;
        var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var full = Path.Combine(root, rel.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        try { if (System.IO.File.Exists(full)) System.IO.File.Delete(full); } catch { /* ignore */ }
    }
}
