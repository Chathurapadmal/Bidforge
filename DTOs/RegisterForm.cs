using Microsoft.AspNetCore.Http;

namespace Bidforge.DTOs;

public class RegisterForm
{
    public string FullName { get; set; } = "";
    public string UserName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string? NicNumber { get; set; }
    public string Password { get; set; } = "";
    public string ConfirmPassword { get; set; } = "";

    public IFormFile? NicPic { get; set; }
    public IFormFile? SelfyPic { get; set; }
}
