using Microsoft.AspNetCore.Identity;

namespace Bidforge.Models;

public class ApplicationUser : IdentityUser
{
    public string? FullName { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? DisplayName { get; set; }
    public string? NicImagePath { get; set; }
    public string? SelfieImagePath { get; set; }
    public string? NicNumber { get; set; }
    public string? AvatarUrl { get; set; }
}
