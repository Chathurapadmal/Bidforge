using Microsoft.AspNetCore.Identity;

namespace Bidforge.Models;

public class ApplicationUser : IdentityUser
{
    // Extra fields
    public string? FullName { get; set; }          // optional
    public string? NicNumber { get; set; }
    public string? MobileNumber { get; set; }

    public string? SelfiePath { get; set; }        // /uploads/selfies/xxx.jpg
    public string? NicImagePath { get; set; }      // /uploads/nics/xxx.jpg

    public bool IsApproved { get; set; }           // set by admin
    public DateTime? TermsAcceptedAt { get; set; } // when user accepted T&C
}
