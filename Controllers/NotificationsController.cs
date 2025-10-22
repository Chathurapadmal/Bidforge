// File: Controllers/NotificationsController.cs
using System.Security.Claims;
using Bidforge.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotificationsController(AppDbContext db) { _db = db; }

    private static string? UID(ClaimsPrincipal u) =>
        u.FindFirst("sub")?.Value ?? u.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int take = 50, CancellationToken ct = default)
    {
        var id = UID(User);
        if (id is null) return Unauthorized();

        take = Math.Clamp(take, 1, 200);

        var items = await _db.Notifications.AsNoTracking()
            .Where(n => n.UserId == id)
            .OrderByDescending(n => n.Id)
            .Take(take)
            .Select(n => new {
                id = n.Id,
                type = n.Type,
                message = n.Message,
                createdAt = n.CreatedAtUtc,
                isRead = n.IsRead,
                data = n.DataJson
            })
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpPost("read/{id:int}")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct = default)
    {
        var uid = UID(User);
        if (uid is null) return Unauthorized();

        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == uid, ct);
        if (n is null) return NotFound();

        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return Ok(new { ok = true });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct = default)
    {
        var uid = UID(User);
        if (uid is null) return Unauthorized();

        var qs = _db.Notifications.Where(x => x.UserId == uid && !x.IsRead);
        await qs.ExecuteUpdateAsync(s => s.SetProperty(x => x.IsRead, true), ct);
        return Ok(new { ok = true });
    }
}
