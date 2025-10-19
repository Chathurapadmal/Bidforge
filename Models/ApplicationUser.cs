using Microsoft.AspNetCore.Identity;

namespace Bidforge.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Approval + timestamps
        public bool IsApproved { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Profile (used in UI)
        public string? FullName { get; set; }
        public string MobileNumber { get; set; } = "";
        public string NicNumber { get; set; } = "";

        // Profile picture
        public string? ProfilePicture { get; set; }   // 👈 added this property

        // KYC upload paths
        public string? SelfiePath { get; set; }
        public string? NicImagePath { get; set; }

        // Terms
        public DateTime? TermsAcceptedAt { get; set; }
    }
}
