// Controllers/AuthController.cs
using System.Security.Cryptography;
using System.Text;
using Bidforge.Contracts;
using Bidforge.Data;
using Bidforge.Models;
using Bidforge.Services; // MkMailSender
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(
    UserManager<ApplicationUser> userManager,
    IJwtTokenService jwt,
    MkEMailSender emailSender,
    IWebHostEnvironment env,
    AppDbContext db
) : ControllerBase
{
    // POST /api/auth/register (multipart/form-data)
    [HttpPost("register")]
    [RequestSizeLimit(20_000_000)]
    public async Task<IActionResult> Register([FromForm] RegisterRequest req)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        if (await userManager.FindByEmailAsync(req.Email) is not null)
            return Conflict(new { message = "Email already in use." });

        if (await userManager.Users.AnyAsync(u => u.UserName == req.UserName))
            return Conflict(new { message = "Username already in use." });

        var user = new ApplicationUser
        {
            FullName = req.FullName,
            UserName = req.UserName,
            Email = req.Email,
            PhoneNumber = req.PhoneNumber,
            NicNumber = req.NicNumber ?? "",
            IsApproved = false
        };

        var create = await userManager.CreateAsync(user, req.Password);
        if (!create.Succeeded) return BadRequest(new { errors = create.Errors });

        // Save KYC photos
        var wwwroot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var root = Path.Combine(wwwroot, "images", "kyc", user.Id);
        Directory.CreateDirectory(root);

        if (req.NicPic is not null && req.NicPic.Length > 0)
        {
            var path = Path.Combine(root, "nic" + Path.GetExtension(req.NicPic.FileName));
            using var fs = System.IO.File.Create(path);
            await req.NicPic.CopyToAsync(fs);
            user.NicImagePath = ToWebPath(wwwroot, path);
        }
        if (req.SelfyPic is not null && req.SelfyPic.Length > 0)
        {
            var path = Path.Combine(root, "selfie" + Path.GetExtension(req.SelfyPic.FileName));
            using var fs = System.IO.File.Create(path);
            await req.SelfyPic.CopyToAsync(fs);
            user.SelfiePath = ToWebPath(wwwroot, path);
        }
        await userManager.UpdateAsync(user);

        // Email confirmation
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encoded = Uri.EscapeDataString(token);
        var confirmUrl = $"{Request.Scheme}://{Request.Host}/api/auth/confirm-email?userId={user.Id}&token={encoded}";

        await emailSender.SendAsync(user.Email!, "Confirm your email",
            $"<p>Hi {user.FullName},</p><p>Please confirm your email: <a href=\"{confirmUrl}\">Confirm</a></p>");

        return Ok(new { message = "Registered. Please check your email to confirm." });
    }

    // GET /api/auth/confirm-email?userId=&token=
    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user is null) return NotFound(new { message = "User not found." });

        var res = await userManager.ConfirmEmailAsync(user, token);
        if (!res.Succeeded) return BadRequest(new { errors = res.Errors });

        return Content("Email confirmed. You can close this window and login.");
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await userManager.Users
            .FirstOrDefaultAsync(u => u.Email == req.EmailOrUserName || u.UserName == req.EmailOrUserName);

        if (user is null) return Unauthorized(new { message = "Invalid credentials." });
        if (!user.EmailConfirmed) return Unauthorized(new { message = "Please confirm your email first." });

        var passOk = await userManager.CheckPasswordAsync(user, req.Password);
        if (!passOk) return Unauthorized(new { message = "Invalid credentials." });

        var roles = await userManager.GetRolesAsync(user);
        var token = jwt.Create(user, roles);

        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        });

        return Ok(new
        {
            token,
            user = new
            {
                user.Id,
                user.FullName,
                user.UserName,
                user.Email,
                user.PhoneNumber,
                user.IsApproved,
                user.NicImagePath,
                user.SelfiePath
            }
        });
    }

    // POST /api/auth/logout (optional)
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token", new CookieOptions { Path = "/" });
        return Ok(new { message = "Signed out." });
    }

    // === Forgot password (OTP via email) ===

    // POST /api/auth/forgot
    [HttpPost("forgot")]
    public async Task<IActionResult> Forgot([FromBody] ForgotPasswordRequest req)
    {
        var user = await userManager.FindByEmailAsync(req.Email);
        if (user is null) return Ok(new { message = "If the email exists, an OTP has been sent." });

        var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var ticket = new PasswordResetTicket
        {
            UserId = user.Id,
            OtpHash = Hash(code),
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };
        db.PasswordResetTickets.Add(ticket);
        await db.SaveChangesAsync();

        await emailSender.SendAsync(user.Email!, "Your password reset code",
            $"<p>Use this code within 10 minutes: <b>{code}</b></p>");

        return Ok(new { message = "If the email exists, an OTP has been sent." });
    }

    // POST /api/auth/verify-otp
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest req)
    {
        var user = await userManager.FindByEmailAsync(req.Email);
        if (user is null) return Unauthorized(new { message = "Invalid code." });

        var ticket = await db.PasswordResetTickets
            .Where(t => t.UserId == user.Id && !t.Used && t.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();

        if (ticket is null || ticket.OtpHash != Hash(req.Code))
            return Unauthorized(new { message = "Invalid or expired code." });

        ticket.VerifiedAt = DateTime.UtcNow;
        ticket.ResetToken = Guid.NewGuid().ToString("N");
        await db.SaveChangesAsync();

        return Ok(new { resetToken = ticket.ResetToken });
    }

    // POST /api/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var ticket = await db.PasswordResetTickets
            .FirstOrDefaultAsync(t => t.ResetToken == req.ResetToken && !t.Used && t.VerifiedAt != null && t.ExpiresAt > DateTime.UtcNow);
        if (ticket is null) return Unauthorized(new { message = "Invalid reset token." });

        var user = await userManager.FindByIdAsync(ticket.UserId);
        if (user is null) return NotFound();

        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var res = await userManager.ResetPasswordAsync(user, token, req.NewPassword);
        if (!res.Succeeded) return BadRequest(new { errors = res.Errors });

        ticket.Used = true;
        await db.SaveChangesAsync();

        return Ok(new { message = "Password has been reset. Please login." });
    }

    // helpers
    private static string Hash(string value)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(value)));
    }

    private static string ToWebPath(string wwwroot, string absolutePath)
    {
        var rel = Path.GetRelativePath(wwwroot, absolutePath).Replace('\\', '/');
        return "/" + rel;
    }
}
