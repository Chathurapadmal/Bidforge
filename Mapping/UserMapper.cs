using Bidforge.DTOs;
using Bidforge.Models;

namespace Bidforge.Mapping;

public static class UserMapper
{
    public static object ToDto(this ApplicationUser u) =>
        new
        {
            id = u.Id,
            email = u.Email,
            userName = u.UserName,
            fullName = u.FullName,
            phoneNumber = u.PhoneNumber,
            isApproved = u.IsApproved,
            createdAt = u.CreatedAt,
            nicImagePath = u.NicImagePath,
            selfieImagePath = u.SelfieImagePath,
            nicNumber = u.NicNumber
        };
}
