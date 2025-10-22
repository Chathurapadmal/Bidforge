namespace Bidforge.DTOs;

public record LoginDto(string Email, string? UserName, string Password);

public record UserDto(
    string Id,
    string? Email,
    string? UserName,
    string? FullName,
    string? PhoneNumber,
    bool IsApproved,
    DateTime CreatedAt,
    string? NicImagePath,
    string? SelfieImagePath,
    string? NicNumber
);
