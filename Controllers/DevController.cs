using Bidforge.Services;
using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/dev")]
public class DevController(IEmailSender email) : ControllerBase
{
    [HttpPost("test-email")]
    public async Task<IActionResult> TestEmail([FromQuery] string to)
    {
        if (string.IsNullOrWhiteSpace(to)) return BadRequest(new { message = "Specify ?to=email" });
        await email.SendEmailAsync(to, "Bidforge test email", "<p>If you can read this, SMTP works ✅</p>");
        return Ok(new { message = "Sent." });
    }
}
