using Microsoft.AspNetCore.Mvc;

namespace Bidforge.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;

        public UploadController(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        [HttpPost]
        [RequestSizeLimit(20_000_000)] 
        public async Task<IActionResult> Post([FromForm] IFormFile file)
        {
            if (file is null || file.Length == 0)
                return BadRequest("No file");

            var configuredPath = _config["FrontendImagesPath"];
            string imagesDir = !string.IsNullOrWhiteSpace(configuredPath)
                ? Path.GetFullPath(Path.Combine(_env.ContentRootPath, configuredPath))
                : Path.GetFullPath(Path.Combine(_env.ContentRootPath, "..", "frontend", "public", "images"));

            Directory.CreateDirectory(imagesDir);

            var baseName = Path.GetFileNameWithoutExtension(file.FileName);
            var ext = Path.GetExtension(file.FileName);
            var safeBase = string.Concat(baseName.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_'));
            if (string.IsNullOrWhiteSpace(safeBase)) safeBase = "upload";
            var unique = $"{safeBase}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{ext}";
            var savePath = Path.Combine(imagesDir, unique);

            await using (var fs = new FileStream(savePath, FileMode.Create))
                await file.CopyToAsync(fs);

            var url = $"/images/{unique}";
            return Ok(new { url });
        }
    }
}
