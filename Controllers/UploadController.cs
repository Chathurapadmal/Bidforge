using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost]
    [RequestSizeLimit(25_000_000)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        // Ensure wwwroot/images exists
        var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var imageDir = Path.Combine(webRoot, "images");
        Directory.CreateDirectory(imageDir);

        // Make safe unique filename
        var safeName = Path.GetFileNameWithoutExtension(file.FileName)
            .Replace(" ", "_")
            .Replace("-", "_");
        var ext = Path.GetExtension(file.FileName);
        var finalName = $"{safeName}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(imageDir, finalName);

        // Save file
        await using (var fs = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(fs);
        }

        // Return relative and absolute URLs
        var relUrl = $"/images/{Uri.EscapeDataString(finalName)}";
        var absUrl = $"{Request.Scheme}://{Request.Host}{relUrl}";

        return Ok(new
        {
            fileName = finalName,
            url = relUrl,
            fullUrl = absUrl
        });
    }
}
