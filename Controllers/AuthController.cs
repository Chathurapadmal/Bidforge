// File: Controllers/AuthController.cs
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly SignInManager<ApplicationUser> _signIn;
    private readonly JwtTokenService _jwt;
    private readonly IEmailSender _email;
    private readonly IConfiguration _cfg;

    public AuthController(
        UserManager<ApplicationUser> users,
        SignInManager<ApplicationUser> signIn,
        JwtTokenService jwt,
        IEmailSender email,
        IConfiguration cfg)
    {
        _users = users;
        _signIn = signIn;
        _jwt = jwt;
        _email = email;
        _cfg = cfg;
    }

    // ---------- DTOs ----------
    public record AuthUserDto(string id, string? email, string? name, bool emailConfirmed);
    public record AuthResp(string token, AuthUserDto user);

    public class RegisterDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
        [MaxLength(100)] public string? Name { get; set; }
    }

    public class LoginDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required] public string Password { get; set; } = default!;
    }

    public class VerifyDto
    {
        [Required] public string UserId { get; set; } = default!;
        [Required] public string Token { get; set; } = default!;
    }

    // ---------- Register ----------
    // Creates user and emails a verification link (MailKit)
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var exists = await _users.FindByEmailAsync(dto.Email);
        if (exists is not null)
            return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = string.IsNullOrWhiteSpace(dto.Name) ? null : dto.Name!.Trim()
        };

        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        // Generate email confirmation token and send verify link
        var token = await _users.GenerateEmailConfirmationTokenAsync(user);
        var encToken = Uri.EscapeDataString(token);

        var frontendBase = _cfg["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var verifyUrl = $"{frontendBase}/auth/verify?userId={user.Id}&token={encToken}";

        await _email.SendAsync(
            user.Email!,
            "Verify your email",
            $@"<p>Welcome to Bidforge!</p>
               <p>Please verify your email by clicking the link below:</p>
               <p><a href=""{verifyUrl}"">Verify my email</a></p>");

        // No auto-login; frontend shows “check your email”
        return Ok(new { ok = true, userId = user.Id, email = user.Email });
    }

    // ---------- Login ----------
    // Enforces EmailConfirmed (return 403 if not verified)
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null) return Unauthorized(new { message = "Invalid credentials." });

        var ok = await _users.CheckPasswordAsync(user, dto.Password);
        if (!ok) return Unauthorized(new { message = "Invalid credentials." });

        if (!user.EmailConfirmed)
            return StatusCode(403, new { message = "Please verify your email before logging in." });

        var token = _jwt.CreateToken(user);
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.EmailConfirmed);
        return Ok(new AuthResp(token, u));
    }

    // ---------- Verify Email ----------
    [HttpPost("verify-email")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromBody] VerifyDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var user = await _users.FindByIdAsync(dto.UserId);
        if (user is null) return NotFound(new { message = "User not found" });

        var token = Uri.UnescapeDataString(dto.Token ?? "");
        var res = await _users.ConfirmEmailAsync(user, token);
        if (!res.Succeeded)
            return BadRequest(new { message = string.Join("; ", res.Errors.Select(e => e.Description)) });

        return Ok(new { ok = true });
    }

    // ---------- Me ----------
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var id = User?.FindFirstValue("sub")
                 ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(id)) return Unauthorized();

        var user = await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();

        var dto = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.EmailConfirmed);
        return Ok(dto);
    }
}
