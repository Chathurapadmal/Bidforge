// Services/JwtTokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bidforge.Models;
using Bidforge.Options;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Bidforge.Services;

public interface IJwtTokenService
{
    string Create(ApplicationUser user, IList<string> roles);
}

public sealed class JwtTokenService(IOptions<JwtOptions> opts) : IJwtTokenService
{
    private readonly JwtOptions _opt = opts.Value;

    public string Create(ApplicationUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new("name", user.FullName ?? user.UserName ?? ""),
            new("approved", user.IsApproved.ToString())
        };
        foreach (var r in roles) claims.Add(new Claim(ClaimTypes.Role, r));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _opt.Issuer,
            audience: _opt.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
