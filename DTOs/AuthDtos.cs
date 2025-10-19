// Contracts/AuthDtos.cs
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Bidforge.Contracts;

public class RegisterRequest
{
    [Required] public string FullName { get; set; } = "";
    [Required] public string UserName { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string PhoneNumber { get; set; } = "";
    public string? NicNumber { get; set; }

    [Required] public string Password { get; set; } = "";
    [Required, Compare(nameof(Password))] public string ConfirmPassword { get; set; } = "";

    // multipart/form-data
    public IFormFile? NicPic { get; set; }
    public IFormFile? SelfyPic { get; set; } // note: your request spelled SelfyPic
}

public class LoginRequest
{
    public string EmailOrUserName { get; set; } = "";
    public string Password { get; set; } = "";
}

public class ForgotPasswordRequest
{
    [Required, EmailAddress] public string Email { get; set; } = "";
}
public class VerifyOtpRequest
{
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Code { get; set; } = ""; // 6 digits
}
public class ResetPasswordRequest
{
    [Required] public string ResetToken { get; set; } = "";
    [Required] public string NewPassword { get; set; } = "";
    [Required, Compare(nameof(NewPassword))] public string ConfirmPassword { get; set; } = "";
}
