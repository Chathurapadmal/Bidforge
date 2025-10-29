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
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    private readonly SignInManager<ApplicationUser> _signIn;
    private readonly JwtTokenService _jwt;

    public AuthController(UserManager<ApplicationUser> users, SignInManager<ApplicationUser> signIn, JwtTokenService jwt)
    {
        _users = users; _signIn = signIn; _jwt = jwt;
    }

    public record AuthUserDto(string id, string? email, string? name, string? role = null);
    public record AuthResp(string token, AuthUserDto user);

    // ---------- Register ----------
    public class RegisterDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
        [MaxLength(100)] public string? Name { get; set; }
    }

    // ---------- Admin Register ----------
    public class AdminRegisterDto
    {
        [Required, EmailAddress] public string Email { get; set; } = default!;
        [Required, MinLength(6)] public string Password { get; set; } = default!;
        [MaxLength(100)] public string? Name { get; set; }
        [Required] public string Role { get; set; } = default!; // "User" or "Admin"
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
            DisplayName = dto.Name,
            Role = "User", // Default role for regular registration
            IsApproved = false // New users need admin approval after NIC submission
        };

        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var token = _jwt.CreateToken(user);
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.Role);
        return Ok(new AuthResp(token, u));
    }

    // ---------- Admin Register ----------
    [HttpPost("register-admin")]
    [AllowAnonymous] // In production, you might want to restrict this or add special validation
    public async Task<IActionResult> RegisterAdmin([FromBody] AdminRegisterDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        // Validate role
        if (dto.Role != "User" && dto.Role != "Admin")
            return BadRequest(new { message = "Role must be 'User' or 'Admin'." });

        var exists = await _users.FindByEmailAsync(dto.Email);
        if (exists is not null) return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            Email = dto.Email,
            UserName = dto.Email,
            DisplayName = dto.Name,
            Role = dto.Role
        };

        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });

        var token = _jwt.CreateToken(user);
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.Role);
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
        var u = new AuthUserDto(user.Id, user.Email, user.DisplayName ?? user.Email, user.Role);
        return Ok(new AuthResp(token, u));
    }

    // ---------- Me ----------
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var id = User?.FindFirst("sub")?.Value ?? User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        var email = User?.FindFirst("email")?.Value;
        var name = User?.FindFirst("name")?.Value ?? email;
        var role = User?.FindFirst("role")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(id)) return Unauthorized();
        
        // Get user approval status and NIC info
        var user = await _users.FindByIdAsync(id);
        if (user == null) return Unauthorized();
        
        return Ok(new {
            id = id!,
            email,
            name,
            role,
            isApproved = user.IsApproved,
            hasNicNumber = !string.IsNullOrEmpty(user.NicNumber),
            hasNicImage = !string.IsNullOrEmpty(user.NicImagePath)
        });
    }

    // ---------- Submit NIC Information ----------
    public class SubmitNicDto
    {
        [Required] public string NicNumber { get; set; } = default!;
        [Required] public IFormFile NicImage { get; set; } = default!;
    }

    [HttpPost("submit-nic")]
    [Authorize]
    public async Task<IActionResult> SubmitNic([FromForm] SubmitNicDto dto)
    {
        var id = User?.FindFirst("sub")?.Value ?? User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        if (string.IsNullOrEmpty(id)) return Unauthorized();

        var user = await _users.FindByIdAsync(id);
        if (user == null) return Unauthorized();

        // Validate file
        if (dto.NicImage.Length > 5 * 1024 * 1024) // 5MB limit
            return BadRequest("Image file too large. Maximum size is 5MB.");

        var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
        if (!allowedTypes.Contains(dto.NicImage.ContentType.ToLower()))
            return BadRequest("Invalid file type. Only JPEG and PNG images are allowed.");

        // Create upload directory
        var uploadsDir = Path.Combine("wwwroot", "uploads", "nic");
        Directory.CreateDirectory(uploadsDir);

        // Generate unique filename
        var extension = Path.GetExtension(dto.NicImage.FileName);
        var fileName = $"{user.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
        var filePath = Path.Combine(uploadsDir, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await dto.NicImage.CopyToAsync(stream);
        }

        // Update user
        user.NicNumber = dto.NicNumber;
        user.NicImagePath = $"/uploads/nic/{fileName}";

        var result = await _users.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest("Failed to update user information.");

        return Ok(new { message = "NIC information submitted successfully. Your account is now pending admin approval." });
    }
}
