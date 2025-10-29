using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using Bidforge.Data;
using Bidforge.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize] // Require authentication
public class AdminController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly AppDbContext _context;

    public AdminController(UserManager<ApplicationUser> userManager, AppDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    // Check if current user is admin
    private bool IsAdmin()
    {
        var role = User?.FindFirst("role")?.Value ?? User?.FindFirst(ClaimTypes.Role)?.Value;
        return role == "Admin";
    }

    // DTO for admin user response
    public record AdminUserDto(
        string Id,
        string? Email,
        string? UserName,
        string? FullName,
        string? PhoneNumber,
        bool IsApproved,
        string CreatedAt,
        string Role,
        string? NicNumber = null,
        string? NicImagePath = null
    );

    // ---------- Get Users ----------
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string status = "all", // "pending", "approved", "all"
        [FromQuery] string? search = null,
        [FromQuery] int limit = 100)
    {
        if (!IsAdmin())
            return Forbid("Admin access required.");

        var query = _context.Users.AsQueryable();

        // Filter by status
        if (status == "pending")
            query = query.Where(u => !u.IsApproved);
        else if (status == "approved")
            query = query.Where(u => u.IsApproved);
        // "all" means no filter

        // Search filter
        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchTerm = search.Trim().ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(searchTerm)) ||
                (u.UserName != null && u.UserName.ToLower().Contains(searchTerm)) ||
                (u.FullName != null && u.FullName.ToLower().Contains(searchTerm)) ||
                (u.PhoneNumber != null && u.PhoneNumber.ToLower().Contains(searchTerm))
            );
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Take(Math.Min(limit, 500)) // Cap at 500 for performance
            .Select(u => new AdminUserDto(
                u.Id,
                u.Email,
                u.UserName,
                u.FullName,
                u.PhoneNumber,
                u.IsApproved,
                u.CreatedAt.ToString("O"), // ISO 8601 format
                u.Role,
                u.NicNumber,
                u.NicImagePath
            ))
            .ToListAsync();

        return Ok(users);
    }

    // ---------- Approve User ----------
    [HttpPatch("users/{id}/approve")]
    public async Task<IActionResult> ApproveUser(string id)
    {
        if (!IsAdmin())
            return Forbid("Admin access required.");

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        user.IsApproved = true;
        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
            return BadRequest("Failed to approve user.");

        return Ok(new { message = "User approved successfully." });
    }

    // ---------- Delete User ----------
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (!IsAdmin())
            return Forbid("Admin access required.");

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        // Prevent admin from deleting themselves
        var currentUserId = User?.FindFirst("sub")?.Value ?? 
                           User?.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        
        if (user.Id == currentUserId)
            return BadRequest("Cannot delete your own account.");

        // Check if user has any auctions (as seller or winner)
        var hasAuctions = await _context.Auctions
            .AnyAsync(a => a.SellerId == id || a.WinnerId == id);
        
        if (hasAuctions)
        {
            return BadRequest(new { 
                message = "Cannot delete user with associated auctions. Please reassign or delete their auctions first.",
                hasAuctions = true
            });
        }

        // Check if user has any bids
        var hasBids = await _context.Bids
            .AnyAsync(b => b.BidderId == id);
            
        if (hasBids)
        {
            return BadRequest(new { 
                message = "Cannot delete user with bid history. User has placed bids on auctions.",
                hasBids = true
            });
        }

        try
        {
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to delete user: " + string.Join("; ", result.Errors.Select(e => e.Description)) });

            return Ok(new { message = "User deleted successfully." });
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Cannot delete user due to database constraints. User may have related data." });
        }
    }

    // ---------- Get User Details ----------
    [HttpGet("users/{id}/details")]
    public async Task<IActionResult> GetUserDetails(string id)
    {
        if (!IsAdmin())
            return Forbid("Admin access required.");

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            return NotFound("User not found.");

        var auctionCount = await _context.Auctions.CountAsync(a => a.SellerId == id);
        var wonAuctionCount = await _context.Auctions.CountAsync(a => a.WinnerId == id);
        var bidCount = await _context.Bids.CountAsync(b => b.BidderId == id);

        return Ok(new
        {
            user = new AdminUserDto(
                user.Id,
                user.Email,
                user.UserName,
                user.FullName,
                user.PhoneNumber,
                user.IsApproved,
                user.CreatedAt.ToString("O"),
                user.Role,
                user.NicNumber,
                user.NicImagePath
            ),
            auctionCount,
            wonAuctionCount,
            bidCount,
            canDelete = auctionCount == 0 && wonAuctionCount == 0 && bidCount == 0
        });
    }

    // ---------- Get Admin Stats ----------
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        if (!IsAdmin())
            return Forbid("Admin access required.");

        var totalUsers = await _context.Users.CountAsync();
        var pendingUsers = await _context.Users.CountAsync(u => !u.IsApproved);
        var approvedUsers = await _context.Users.CountAsync(u => u.IsApproved);
        var adminUsers = await _context.Users.CountAsync(u => u.Role == "Admin");

        return Ok(new
        {
            totalUsers,
            pendingUsers,
            approvedUsers,
            adminUsers
        });
    }
}