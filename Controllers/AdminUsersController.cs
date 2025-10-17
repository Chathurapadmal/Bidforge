using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/admin/users")]
[Produces("application/json")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminUsersController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string status = "pending",
                                              [FromQuery] int limit = 200,
                                              [FromQuery] string? search = null)
    {
        var q = _db.Users.AsNoTracking().AsQueryable();

        switch ((status ?? "pending").Trim().ToLowerInvariant())
        {
            case "pending": q = q.Where(u => !u.IsApproved); break;
            case "approved": q = q.Where(u => u.IsApproved); break;
            case "all": default: break;
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            q = q.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(s)) ||
                (u.UserName != null && u.UserName.ToLower().Contains(s)) ||
                (u.FullName != null && u.FullName.ToLower().Contains(s)) ||
                (u.PhoneNumber != null && u.PhoneNumber.ToLower().Contains(s)) ||
                (u.MobileNumber != null && u.MobileNumber.ToLower().Contains(s)) ||
                (u.NicNumber != null && u.NicNumber.ToLower().Contains(s))
            );
        }

        limit = Math.Clamp(limit, 1, 1000);

        var list = await q
            .OrderBy(u => u.IsApproved)
            .ThenByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new
            {
                id = u.Id,
                email = u.Email,
                userName = u.UserName,
                fullName = u.FullName,
                phoneNumber = u.PhoneNumber ?? u.MobileNumber,
                isApproved = u.IsApproved,
                createdAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById([FromRoute] string id)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new
            {
                id = u.Id,
                email = u.Email,
                userName = u.UserName,
                fullName = u.FullName,
                phoneNumber = u.PhoneNumber ?? u.MobileNumber,
                isApproved = u.IsApproved,
                createdAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null) return NotFound(new { message = "User not found" });
        return Ok(user);
    }

    [HttpPatch("{id}/approve")]
    public async Task<IActionResult> ApproveUser([FromRoute] string id)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound(new { message = "User not found" });

        if (!user.IsApproved)
        {
            user.IsApproved = true;
            await _db.SaveChangesAsync();
        }

        return Ok(new { ok = true });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser([FromRoute] string id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(currentUserId) && currentUserId == id)
            return BadRequest(new { message = "You cannot delete your own account." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null)
            return NotFound(new { message = $"User not found: {id}" });

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
