using Microsoft.AspNetCore.Mvc;

public class AuthController : ControllerBase
{
    private readonly IEmailSender _emailSender;

    public AuthController(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    // Inside Register()
    await _emailSender.SendEmailAsync(user.Email, "Verify your Bidforge email", htmlBody);
}
