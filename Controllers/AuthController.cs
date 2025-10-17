using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bidforge.DTOs;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.WebUtilities; // WebEncoders

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    IOptions<JwtOptions> jwtOptions,
    IWebHostEnvironment env,
    IEmailSender emailSender,
    IConfiguration config) : ControllerBase
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public record RegisterDto(
        string UserName,
        string Email,
        string Password,
        string MobileNumber,
        string NicNumber,
        bool AgreeTerms);

    // --- POST /api/auth/register  (multipart: selfie, nicImage) ---
    [HttpPost("register")]
    [AllowAnonymous]
    [RequestSizeLimit(25_000_000)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Register([FromForm] RegisterDto dto)
    {
        if (!dto.AgreeTerms)
            return BadRequest(new { message = "You must agree to Terms & Conditions." });

        var exists = await userManager.Users.AnyAsync(u =>
            u.Email == dto.Email || u.UserName == dto.UserName);
        if (exists)
            return BadRequest(new { message = "Username or Email already exists." });

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

        var selfieFile = Request.Form.Files.GetFile("selfie");
        var nicFile = Request.Form.Files.GetFile("nicImage");
        if (selfieFile is null || selfiesize(selfieFile) == 0)
            return BadRequest(new { message = "Selfie is required." });
        if (nicFile is null || selfiesize(nicFile) == 0)
            return BadRequest(new { message = "NIC image is required." });

        var selfiePath = await SaveUpload(selfieFile, "selfies");
        var nicPath = await SaveUpload(nicFile, "nics");
        user.SelfiePath = selfiePath;
        user.NicImagePath = nicPath;

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var urlToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var frontBase = config["Frontend:BaseUrl"];
        var confirmUrl = !string.IsNullOrWhiteSpace(frontBase)
            ? $"{frontBase!.TrimEnd('/')}/auth/verify?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(urlToken)}"
            : $"{Request.Scheme}://{Request.Host}/api/auth/verify?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(urlToken)}";

        await emailSender.SendEmailAsync(
            user.Email!,
            "Verify your Bidforge email",
            $@"<p>Welcome to Bidforge, {System.Net.WebUtility.HtmlEncode(user.UserName)}!</p>
               <p>Please verify your email by clicking:</p>
               <p><a href=""{confirmUrl}"">Confirm Email</a></p>");

        return Ok(new { message = "Registered. Check your email to verify. Waiting for admin approval after verification." });
    }

    [HttpGet("confirm-email")]
    [AllowAnonymous]
    public Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
        => Verify(userId, token, html: false);

    [HttpGet("verify")]
    [AllowAnonymous]
    public async Task<IActionResult> Verify([FromQuery] string userId, [FromQuery] string token, [FromQuery] bool html = false)
    {
        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(token))
            return BadRequest(new { message = "Missing userId or token." });

        var user = await userManager.FindByIdAsync(userId);
        if (user == null) return NotFound(new { message = "User not found." });

        string decodedToken;
        try { decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token)); }
        catch { return BadRequest(new { message = "Invalid token format." }); }

        var res = await userManager.ConfirmEmailAsync(user, decodedToken);
        if (!res.Succeeded)
            return BadRequest(new { message = "Email confirmation failed.", details = res.Errors.Select(e => e.Description) });

        if (!html) return Ok(new { message = "Email verified successfully." });

        var loginUrl = config["Frontend:LoginUrl"] ?? (config["Frontend:BaseUrl"] is string fb && !string.IsNullOrWhiteSpace(fb)
            ? $"{fb.TrimEnd('/')}/auth/login" : "/auth/login");

        var htmlBody =
$@"<!doctype html>
<html><head><meta charset=""utf-8""><title>Bidforge – Email Verified</title>
<meta name=""viewport"" content=""width=device-width, initial-scale=1"">
<style>
body{{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f6f7f9;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center}}
.card{{background:#fff;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.08);padding:28px;max-width:520px}}
h1{{margin:0 0 8px;font-size:22px}}
p{{margin:0 0 14px;color:#374151}}
a.btn{{display:inline-block;margin-top:8px;background:#111;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px}}
</style>
</head><body>
<div class=""card"">
  <h1>✅ Email verified</h1>
  <p>Your email has been confirmed. You can log in now.</p>
  <a class=""btn"" href=""{loginUrl}"">Go to Login</a>
</div>
</body></html>";
        return Content(htmlBody, "text/html");
    }

    [HttpPost("resend")]
    [AllowAnonymous]
    public async Task<IActionResult> Resend([FromQuery] string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null) return NotFound(new { message = "User not found." });
        if (await userManager.IsEmailConfirmedAsync(user))
            return Ok(new { message = "Already verified." });

        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var urlToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

        var frontBase = config["Frontend:BaseUrl"];
        var confirmUrl = !string.IsNullOrWhiteSpace(frontBase)
            ? $"{frontBase!.TrimEnd('/')}/auth/verify?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(urlToken)}"
            : $"{Request.Scheme}://{Request.Host}/api/auth/verify?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(urlToken)}";

        await emailSender.SendEmailAsync(user.Email!, "Verify your Bidforge email",
            $@"<p>Click to verify your email:</p><p><a href=""{confirmUrl}"">Confirm Email</a></p>");

        return Ok(new { message = "Verification email resent." });
    }

    // --- POST /api/auth/login ---
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var input = dto.UserNameOrEmail?.Trim() ?? string.Empty;

        ApplicationUser? user =
            await userManager.FindByNameAsync(input) ??
            await userManager.FindByEmailAsync(input);

        if (user == null)
            return Unauthorized(new { message = "Invalid credentials." });

        if (!user.EmailConfirmed)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Please verify your email first." });

        if (!user.IsApproved)
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Awaiting admin approval." });

        var passOk = await userManager.CheckPasswordAsync(user, dto.Password);
        if (!passOk)
            return Unauthorized(new { message = "Invalid credentials." });

        var jwt = MakeJwt(user);

        // 🔐 Set HttpOnly cookie so the browser “remembers” the session
        Response.Cookies.Append("access_token", jwt, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,               // required for SameSite=None over HTTPS
            SameSite = SameSiteMode.None, // because frontend is on a different origin (localhost:3000)
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            IsEssential = true
        });

        return Ok(new
        {
            token = jwt,
            user = new { user.Id, user.UserName, user.Email, user.MobileNumber, user.NicNumber }
        });
    }

    // --- GET /api/auth/me (for the frontend to check session) ---
    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public async Task<IActionResult> Me()
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(uid)) return Unauthorized(new { message = "Unauthorized" });

        var user = await userManager.FindByIdAsync(uid);
        if (user == null) return Unauthorized(new { message = "Unauthorized" });

        return Ok(new
        {
            userId = uid,
            email = user.Email,
            userName = user.UserName,
            name = user.FullName
        });
    }

    // --- POST /api/auth/logout ---
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", new CookieOptions
        {
            Secure = true,
            SameSite = SameSiteMode.None
        });
        return Ok(new { ok = true });
    }

    // ===== utilities =====
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
