// File: Services/JwtTokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bidforge.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bidforge.Services;

public class JwtTokenService
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly SymmetricSecurityKey _signingKey;

    public JwtTokenService(IConfiguration cfg)
    {
        var jwt = cfg.GetSection("Jwt");
        _issuer = jwt["Issuer"] ?? "Bidforge";
        _audience = jwt["Audience"] ?? "BidforgeClient";

        // same dev key as Program.cs
        var keyBytes = Convert.FromHexString("a06f684c8ed4b8cd631643301ea09ffde645a7940ebc7c660d0bfef5fe270294");
        _signingKey = new SymmetricSecurityKey(keyBytes);
    }

    public string CreateToken(ApplicationUser user, TimeSpan? lifetime = null)
    {
        var now = DateTime.UtcNow;
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new("name", user.DisplayName ?? user.UserName ?? user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(ClaimTypes.Role, user.Role), // Add role claim
            new("role", user.Role), // Add custom role claim for easier access
        };

        var creds = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
        var jwt = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            notBefore: now,
            expires: now.Add(lifetime ?? TimeSpan.FromDays(7)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(jwt);
    }
}
