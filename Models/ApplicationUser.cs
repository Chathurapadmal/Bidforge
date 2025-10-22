using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Bidforge.Models;

public class ApplicationUser : IdentityUser
{
    [MaxLength(100)]
    public string? DisplayName { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }  // /uploads/avatars/...

    // --- KYC fields ---
    [MaxLength(500)]
    public string? NicImageUrl { get; set; }   // /uploads/kyc/{userId}_nic.ext

    [MaxLength(500)]
    public string? SelfieImageUrl { get; set; } // /uploads/kyc/{userId}_selfie.ext

    /// <summary>none | pending | approved | rejected</summary>
    [MaxLength(20)]
    public string KycStatus { get; set; } = "none";

    public DateTime? KycReviewedAtUtc { get; set; }

    [MaxLength(450)]
    public string? KycReviewerId { get; set; }
}
