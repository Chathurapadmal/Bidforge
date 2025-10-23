// File: Services/JwtTokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bidforge.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bidforge.Services;

public sealed class JwtTokenService
{
    private readonly IConfiguration _cfg;
    private readonly UserManager<ApplicationUser> _users;

    public JwtTokenService(IConfiguration cfg, UserManager<ApplicationUser> users)
    {
        _cfg = cfg;
        _users = users;
    }

    public string CreateToken(ApplicationUser user)
    {
        var jwtSection = _cfg.GetSection("Jwt");
        var issuer = jwtSection["Issuer"] ?? "Bidforge";
        var audience = jwtSection["Audience"] ?? "BidforgeClient";
        var keyHex = jwtSection["KeyHex"] ??
                       "a06f684c8ed4b8cd631643301ea09ffde645a7940ebc7c660d0bfef5fe270294"; // dev only
        var keyBytes = Convert.FromHexString(keyHex);
        var signingKey = new SymmetricSecurityKey(keyBytes);
        var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        // Base claims
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
        };

        // Optional display name
        var name = user.DisplayName ?? user.Email ?? "";
        if (!string.IsNullOrWhiteSpace(name))
        {
            claims.Add(new Claim("name", name));
        }

        // Roles: add BOTH ClaimTypes.Role and a plain "role" claim (many UIs read one or the other).
        var roles = _users.GetRolesAsync(user).GetAwaiter().GetResult() ?? Array.Empty<string>();
        foreach (var r in roles)
        {
            if (string.IsNullOrWhiteSpace(r)) continue;
            claims.Add(new Claim(ClaimTypes.Role, r)); // what [Authorize(Roles=...)] checks
            claims.Add(new Claim("role", r));          // convenient for JS clients
        }

        var expiresMinutes = int.TryParse(jwtSection["ExpiresMinutes"], out var mins) ? mins : 7 * 24 * 60;

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
