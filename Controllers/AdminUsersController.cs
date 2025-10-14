// Controllers/AdminUsersController.cs
using Bidforge.Models;
using Bidforge.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/admin/users")]
public class AdminUsersController(UserManager<ApplicationUser> userManager) : ControllerBase
{
    // GET /api/admin/users?status=pending|approved|all (default: pending)
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string status = "pending", [FromQuery] int limit = 100)
    {
        var q = userManager.Users.AsNoTracking();

        switch ((status ?? "pending").ToLowerInvariant())
        {
            case "approved":
                q = q.Where(u => u.EmailConfirmed && u.IsApproved);
                break;
            case "all":
                // no filter
                break;
            default: // pending
                q = q.Where(u => u.EmailConfirmed && !u.IsApproved);
                break;
        }

        limit = Math.Clamp(limit, 1, 500);
        var items = await q
            .OrderBy(u => u.UserName)
            .Take(limit)
            .Select(u => new {
                id = u.Id,
                userName = u.UserName,
                email = u.Email,
                emailConfirmed = u.EmailConfirmed,
                isApproved = u.IsApproved,
                mobileNumber = u.MobileNumber,
                nicNumber = u.NicNumber,
                selfiePath = u.SelfiePath,
                nicImagePath = u.NicImagePath,
                termsAcceptedAt = u.TermsAcceptedAt
            })
            .ToListAsync();

        return Ok(new { items, total = items.Count });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get([FromRoute] string id)
    {
        var u = await userManager.FindByIdAsync(id);
        if (u == null) return NotFound();
        return Ok(new
        {
            id = u.Id,
            userName = u.UserName,
            email = u.Email,
            emailConfirmed = u.EmailConfirmed,
            isApproved = u.IsApproved,
            mobileNumber = u.MobileNumber,
            nicNumber = u.NicNumber,
            selfiePath = u.SelfiePath,
            nicImagePath = u.NicImagePath,
            termsAcceptedAt = u.TermsAcceptedAt
        });
    }

    // POST /api/admin/users/{id}/approve
    [HttpPost("{id}/approve")]
    public async Task<IActionResult> Approve([FromRoute] string id)
    {
        var u = await userManager.FindByIdAsync(id);
        if (u == null) return NotFound();
        if (u.IsApproved) return Ok(new { message = "Already approved." });

        u.IsApproved = true;
        await userManager.UpdateAsync(u);
        return Ok(new { message = "User approved." });
    }
}
