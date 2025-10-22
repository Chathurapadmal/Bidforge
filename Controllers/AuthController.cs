// File: Controllers/AuthController.cs
using System.ComponentModel.DataAnnotations;
using Bidforge.Models;
using Bidforge.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly SignInManager<ApplicationUser> _signIn;
    private readonly JwtTokenService _jwt;

    public AuthController(UserManager<ApplicationUser> users, SignInManager<ApplicationUser> signIn, JwtTokenService jwt)
    {
        _users = users; _signIn = signIn; _jwt = jwt;
    }

    public record AuthUserDto(string id, string? email, string? name);
    public record AuthResp(string token, AuthUserDto user);

    // ---------- Register ----------
    public class RegisterDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
        [MaxLength(100)] public string? Name { get; set; }
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var exists = await _users.FindByEmailAsync(dto.Email);
        if (exists is not null) return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = dto.Name
        };

        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var token = _jwt.CreateToken(user);
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email);
        return Ok(new AuthResp(token, u));
    }

    // ---------- Login ----------
    public class LoginDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required] public string Password { get; set; } = default!;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null) return Unauthorized(new { message = "Invalid credentials." });

        var ok = await _users.CheckPasswordAsync(user, dto.Password);
        if (!ok) return Unauthorized(new { message = "Invalid credentials." });

        var token = _jwt.CreateToken(user);
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email);
        return Ok(new AuthResp(token, u));
    }

    // ---------- Me ----------
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var id = User?.FindFirst("sub")?.Value ?? User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var email = User?.FindFirst("email")?.Value;
        var name = User?.FindFirst("name")?.Value ?? email;
        if (string.IsNullOrEmpty(id)) return Unauthorized();
        return Ok(new AuthUserDto(id!, email, name));
    }
}
