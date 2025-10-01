using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new { status = "OK", serverTimeUtc = DateTime.UtcNow });
}
