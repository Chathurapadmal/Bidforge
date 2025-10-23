// File: Controllers/AuthController.cs
using System.ComponentModel.DataAnnotations;
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
    private readonly RoleManager<IdentityRole> _roles;
    private readonly JwtTokenService _jwt;
    private readonly IEmailSender _email;
    private readonly IConfiguration _cfg;

    public AuthController(
        UserManager<ApplicationUser> users,
        SignInManager<ApplicationUser> signIn,
        RoleManager<IdentityRole> roles,
        JwtTokenService jwt,
        IEmailSender email,
        IConfiguration cfg)
    {
        _users = users;
        _signIn = signIn;
        _roles = roles;
        _jwt = jwt;
        _email = email;
        _cfg = cfg;
    }

    // ---------------- DTOs ----------------
    public record AuthUserDto(
        string id,
        string? email,
        string? name,
        bool emailConfirmed,
        string[] roles
    );

    public record AuthResp(string token, AuthUserDto user);

    public class RegisterDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
        [MaxLength(100)] public string? Name { get; set; }
        public string? Role { get; set; } // "User" (default) or "Admin" if allowed
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

    private async Task EnsureRoleAsync(string role)
    {
        if (!await _roles.RoleExistsAsync(role))
            await _roles.CreateAsync(new IdentityRole(role));
    }

    // ---------------- Register ----------------
    // Creates a user and emails a verification link (no auto-login).
    // Set allowPublicAdmin=false if you DON'T want the public form to create admins.
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

        var create = await _users.CreateAsync(user, dto.Password);
        if (!create.Succeeded)
            return BadRequest(new { message = string.Join("; ", create.Errors.Select(e => e.Description)) });

        // Roles: always add "User"
        await EnsureRoleAsync("User");
        await _users.AddToRoleAsync(user, "User");

        // (Optional) Allow public admin creation? (flip to false for safety)
        var allowPublicAdmin = true; // <-- set to false for production
        if (allowPublicAdmin && string.Equals(dto.Role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            await EnsureRoleAsync("Admin");
            await _users.AddToRoleAsync(user, "Admin");
        }

        // Email verification
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

        // No token returned — client should show “check your email”.
        return Ok(new { ok = true, userId = user.Id, email = user.Email });
    }

    // ---------------- Login ----------------
    // Requires EmailConfirmed; returns JWT and user (with roles).
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
        var roles = (await _users.GetRolesAsync(user)).ToArray();
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.EmailConfirmed, roles);
        return Ok(new AuthResp(token, u));
    }

    // ---------------- Verify Email ----------------
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

    // ---------------- Me ----------------
    // Returns current user + roles (based on JWT).
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var id = User?.FindFirstValue("sub")
                 ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(id)) return Unauthorized();

        var user = await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();

        var roles = (await _users.GetRolesAsync(user)).ToArray();
        var dto = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.EmailConfirmed, roles);
        return Ok(dto);
    }

    // ---------------- Session (alias) ----------------
    // Some frontends call /api/auth/session — mirror "me" semantics.
    [HttpGet("session")]
    public async Task<IActionResult> Session()
    {
        if (!(User?.Identity?.IsAuthenticated ?? false))
            return Unauthorized();

        var id = User?.FindFirstValue("sub")
                 ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(id)) return Unauthorized();

        var user = await _users.FindByIdAsync(id);
        if (user is null) return Unauthorized();

        var roles = (await _users.GetRolesAsync(user)).ToArray();
        var dto = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.EmailConfirmed, roles);
        return Ok(dto);
    }
}
