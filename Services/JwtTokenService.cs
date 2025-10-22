// File: Services/JwtTokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bidforge.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Bidforge.Services;

public class JwtTokenService
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
        var jwt = _cfg.GetSection("Jwt");
        var issuer = jwt["Issuer"] ?? "Bidforge";
        var audience = jwt["Audience"] ?? "BidforgeClient";

        // Same hex key used in Program.cs
        var keyHex = "a06f684c8ed4b8cd631643301ea09ffde645a7940ebc7c660d0bfef5fe270294";
        var key = new SymmetricSecurityKey(Convert.FromHexString(keyHex));

        var now = DateTime.UtcNow;

        // Load roles so token has role claims
        var roles = _users.GetRolesAsync(user).GetAwaiter().GetResult() ?? new List<string>();

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim("name", user.DisplayName ?? user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new Claim(JwtRegisteredClaimNames.Nbf, new DateTimeOffset(now).ToUnixTimeSeconds().ToString()),
            new Claim(JwtRegisteredClaimNames.Exp, new DateTimeOffset(now.AddDays(7)).ToUnixTimeSeconds().ToString()),
            new Claim(JwtRegisteredClaimNames.Iss, issuer),
            new Claim(JwtRegisteredClaimNames.Aud, audience)
        };

        foreach (var r in roles)
            claims.Add(new Claim(ClaimTypes.Role, r));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: now,
            expires: now.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
