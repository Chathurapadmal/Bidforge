using System.Security.Claims;
using Bidforge.Models;
using Microsoft.AspNetCore.Identity;

namespace Bidforge.Services;

public class UserApprovalService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public UserApprovalService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(bool IsApproved, string? ErrorMessage)> CheckUserApprovalAsync(ClaimsPrincipal userClaims)
    {
        var userId = userClaims?.FindFirst("sub")?.Value ?? 
                    userClaims?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        
        if (string.IsNullOrEmpty(userId))
            return (false, "User not authenticated.");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return (false, "User not found.");

        if (user.Role == "Admin")
            return (true, null); // Admins bypass approval checks

        if (!user.IsApproved)
        {
            if (string.IsNullOrEmpty(user.NicNumber) || string.IsNullOrEmpty(user.NicImagePath))
            {
                return (false, "Please submit your NIC information in your profile to participate in auctions.");
            }
            else
            {
                return (false, "Your account is pending admin approval. Please wait for verification.");
            }
        }

        return (true, null);
    }
}