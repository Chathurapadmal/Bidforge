// File: Controllers/AdminUsersController.cs
using System.ComponentModel.DataAnnotations;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.Services;
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
    private readonly IEmailSender _email;
    private readonly IConfiguration _cfg;

    public AdminUsersController(
        AppDbContext db,
        UserManager<ApplicationUser> users,
        IWebHostEnvironment env,
        IEmailSender email,
        IConfiguration cfg)
    {
        _db = db; _users = users; _env = env; _email = email; _cfg = cfg;
    }

    // ---------- List all users (existing) ----------
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

        var users = await q.OrderBy(u => u.Email).ToListAsync(ct);

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

    // ---------- Delete user (existing) ----------
    // DELETE /api/admin/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken ct)
    {
        var user = await _db.Users.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (user is null) return NotFound();

        TryDeleteFile(user.AvatarUrl);
        TryDeleteFile(user.NicImageUrl);
        TryDeleteFile(user.SelfieImageUrl);

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

    // ---------- Create Admin (NEW) ----------
    public sealed class CreateAdminDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
        [MaxLength(100)] public string? Name { get; set; }
    }

    // POST /api/admin/users/create-admin
    // Creates a new account, assigns Admin role, and emails a verification link.
    [HttpPost("create-admin")]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto, CancellationToken ct)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        // Ensure roles exist
        var roleMgr = HttpContext.RequestServices.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roleMgr.RoleExistsAsync("Admin")) await roleMgr.CreateAsync(new IdentityRole("Admin"));
        if (!await roleMgr.RoleExistsAsync("User")) await roleMgr.CreateAsync(new IdentityRole("User"));

        var exists = await _users.FindByEmailAsync(dto.Email);
        if (exists is not null) return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name!.Trim()
        };

        var create = await _users.CreateAsync(user, dto.Password);
        if (!create.Succeeded)
            return BadRequest(new { message = string.Join("; ", create.Errors.Select(e => e.Description)) });

        // Assign roles: Admin (and optionally User for baseline)
        await _users.AddToRoleAsync(user, "Admin");
        await _users.AddToRoleAsync(user, "User");

        // Send verification email
        var token = await _users.GenerateEmailConfirmationTokenAsync(user);
        var encToken = Uri.EscapeDataString(token);
        var baseUrl = _cfg["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var verifyUrl = $"{baseUrl}/auth/verify?userId={user.Id}&token={encToken}";

        await _email.SendAsync(
            user.Email!,
            "Verify your admin account",
            $@"<p>Hello {System.Net.WebUtility.HtmlEncode(user.DisplayName ?? user.Email)},</p>
               <p>Your admin account has been created. Please verify your email:</p>
               <p><a href=""{verifyUrl}"">Verify my email</a></p>");

        return Ok(new { ok = true, userId = user.Id, email = user.Email });
    }
}
