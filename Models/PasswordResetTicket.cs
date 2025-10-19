// Models/PasswordResetTicket.cs
using System.ComponentModel.DataAnnotations;

namespace Bidforge.Models;

public class PasswordResetTicket
{
    [Key] public Guid Id { get; set; } = Guid.NewGuid();
    [Required] public string UserId { get; set; } = default!;
    [Required] public string OtpHash { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? VerifiedAt { get; set; }
    public string? ResetToken { get; set; }
}
