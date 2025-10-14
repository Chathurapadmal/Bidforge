using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.DTOs;
using Bidforge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IOptions<JwtOptions> jwtOptions,
    IWebHostEnvironment env,
    IEmailSender emailSender) : ControllerBase
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public record RegisterDto(
        string UserName,
        string Email,
        string Password,
        string MobileNumber,
        string NicNumber,
        bool AgreeTerms);

    // multipart/form-data: fields (above) + files: selfie, nicImage
    [HttpPost("register")]
    [RequestSizeLimit(25_000_000)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Register([FromForm] RegisterDto dto)
    {
        if (!dto.AgreeTerms) return BadRequest(new { message = "You must agree to Terms & Conditions." });

        var exists = await userManager.Users.AnyAsync(u =>
            u.Email == dto.Email || u.UserName == dto.UserName);
        if (exists) return BadRequest(new { message = "Username or Email already exists." });

        var user = new ApplicationUser
        {
            UserName = dto.UserName.Trim(),
            Email = dto.Email.Trim(),
            MobileNumber = dto.MobileNumber.Trim(),
            NicNumber = dto.NicNumber.Trim(),
            EmailConfirmed = false,
            IsApproved = false,
            TermsAcceptedAt = DateTime.UtcNow
        };

        // save files
        var selfieFile = Request.Form.Files.GetFile("selfie");
        var nicFile = Request.Form.Files.GetFile("nicImage");
        if (selfieFile is null || selfiesize(selfieFile) == 0)
            return BadRequest(new { message = "Selfie is required." });
        if (nicFile is null || selfiesize(nicFile) == 0)
            return BadRequest(new { message = "NIC image is required." });

        var selfiePath = await SaveUpload(selfieFile, "selfies");
        var nicPath = await SaveUpload(nicFile, "nics");
        user.SelfiePath = selfiePath; // e.g. /uploads/selfies/abc.jpg
        user.NicImagePath = nicPath;

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        // email confirmation
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);
        var confirmUrl = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encodedToken}";

        await emailSender.SendAsync(user.Email!, "Verify your email",
            $"<p>Welcome to Bidforge, {user.UserName}!</p><p>Please verify your email by clicking:</p><p><a href='{confirmUrl}'>Confirm Email</a></p>");

        return Ok(new { message = "Registered. Check your email to verify. Waiting for admin approval after verification." });
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        var res = await userManager.ConfirmEmailAsync(user, token);
        if (!res.Succeeded) return BadRequest(new { message = "Invalid or expired token." });

        return Ok(new { message = "Email verified successfully." });
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        ApplicationUser? user =
            await userManager.FindByNameAsync(dto.UserNameOrEmail) ??
            await userManager.FindByEmailAsync(dto.UserNameOrEmail);

        if (user == null) return Unauthorized(new { message = "Invalid credentials." });

        if (!user.EmailConfirmed)
            return Unauthorized(new { message = "Please verify your email first." });

        if (!user.IsApproved)
            return Forbid(); // or: return Unauthorized(new { message = "Awaiting admin approval." });

        var passOk = await userManager.CheckPasswordAsync(user, dto.Password);
        if (!passOk) return Unauthorized(new { message = "Invalid credentials." });

        var jwt = MakeJwt(user);
        return Ok(new
        {
            token = jwt,
            user = new { user.Id, user.UserName, user.Email, user.MobileNumber, user.NicNumber }
        });
    }

    // Utility
    private string MakeJwt(ApplicationUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim("username", user.UserName ?? "")
        };

        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static long selfiesize(IFormFile f) => f?.Length ?? 0;

    private async Task<string> SaveUpload(IFormFile file, string subfolder)
    {
        var webroot = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var folder = Path.Combine(webroot, "uploads", subfolder);
        Directory.CreateDirectory(folder);

        var safe = MakeSafeFileName(file.FileName);
        var nameOnly = Path.GetFileNameWithoutExtension(safe);
        var ext = Path.GetExtension(safe);
        var full = Path.Combine(folder, safe);
        int i = 1;
        while (System.IO.File.Exists(full))
        {
            safe = $"{nameOnly}-{i++}{ext}";
            full = Path.Combine(folder, safe);
        }

        using var fs = new FileStream(full, FileMode.CreateNew);
        await file.CopyToAsync(fs);

        return $"/uploads/{subfolder}/{Uri.EscapeDataString(safe)}";
    }

    private static string MakeSafeFileName(string raw)
    {
        var name = Path.GetFileName(raw);
        foreach (var c in Path.GetInvalidFileNameChars()) name = name.Replace(c, '_');
        return name.Replace(" ", "_");
    }
}

public class JwtOptions
{
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public string Key { get; set; } = "";
}
