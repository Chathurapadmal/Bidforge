using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController(IWebHostEnvironment env) : ControllerBase
{
    [HttpPost]
    [RequestSizeLimit(20_000_000)] // ~20MB
    public async Task<IActionResult> Post([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("No file provided.");

        var imagesDir = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images");
        Directory.CreateDirectory(imagesDir);

        var safeName = MakeSafeFileName(file.FileName);
        var targetPath = Path.Combine(imagesDir, safeName);

        // avoid overwrite
        var nameOnly = Path.GetFileNameWithoutExtension(safeName);
        var ext = Path.GetExtension(safeName);
        int i = 1;
        while (System.IO.File.Exists(targetPath))
        {
            safeName = $"{nameOnly}-{i++}{ext}";
            targetPath = Path.Combine(imagesDir, safeName);
        }

        using var fs = new FileStream(targetPath, FileMode.CreateNew);
        await file.CopyToAsync(fs);

        var url = $"/images/{Uri.EscapeDataString(safeName)}";
        return Ok(new { fileName = safeName, url });
    }

    private static string MakeSafeFileName(string raw)
    {
        var name = Path.GetFileName(raw);
        foreach (var c in Path.GetInvalidFileNameChars())
            name = name.Replace(c, '_');
        return name.Replace(" ", "_");
    }
}
