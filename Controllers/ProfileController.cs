// Controllers/ProfileController.cs
using System.Security.Claims;
using Bidforge.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    public ProfileController(AppDbContext db, IWebHostEnvironment env)
    {
        _db = db;
        _env = env;
    }

    // GET /api/profile
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized(new { message = "No user." });

        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new
        {
            userName = user.UserName,
            email = user.Email,
            fullName = user.FullName,
            profilePicture = user.ProfilePicture // e.g. "/profile-pictures/abc.jpg"
        });
    }

    // alias if you ever call /api/profile/me
    [HttpGet("me")]
    public Task<IActionResult> Me() => GetProfile();

    // POST /api/profile/upload-picture  (multipart/form-data)
    [HttpPost("upload-picture")]
    [RequestSizeLimit(10_000_000)]
    public async Task<IActionResult> UploadPicture([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest(new { message = "No file uploaded." });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized(new { message = "No user." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "User not found." });

        var wwwroot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploads = Path.Combine(wwwroot, "profile-pictures");
        Directory.CreateDirectory(uploads);

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploads, fileName);
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.ProfilePicture = $"/profile-pictures/{fileName}";
        await _db.SaveChangesAsync();

        return Ok(new { message = "Profile picture updated.", path = user.ProfilePicture });
    }
}
