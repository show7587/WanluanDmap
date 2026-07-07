using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using WanluanDmapApi.Common;

namespace WanluanDmapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PhotoController : ControllerBase
{
    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
    private const long MaxFileSize = 10 * 1024 * 1024; // 10 MB

    private readonly ILogger<PhotoController> _logger;
    private readonly string _photoDirectory;

    public PhotoController(IConfiguration configuration, IWebHostEnvironment env, ILogger<PhotoController> logger)
    {
        _logger = logger;

        var configuredPath = configuration["PhotoDirectoryPath"] ?? "../frontend/public/pic";
        _photoDirectory = Path.GetFullPath(Path.Combine(env.ContentRootPath, configuredPath));
    }

    /// <summary>
    /// 上傳一張照片到 frontend/public/pic/，回傳實際存檔的檔名（不含路徑），
    /// 供 RoadHazard.Photo 欄位使用。
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiError("4000", "No file uploaded"));
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new ApiError("4000", $"Unsupported file type: {extension}"));
            }

            Directory.CreateDirectory(_photoDirectory);

            var fileName = BuildSafeFileName(file.FileName, extension);
            var fullPath = Path.Combine(_photoDirectory, fileName);
            await using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            _logger.LogInformation("Saved photo {FileName} to {Directory}", fileName, _photoDirectory);
            return Ok(new ApiResult<string>(fileName));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Photo upload failed");
            return StatusCode(500, new ApiError("5000", ex.Message));
        }
    }

    // 清掉不合法字元、避免路徑跳脫，撞名時在檔名後加 -1、-2…（保留原檔名可讀性，方便 git diff）。
    private string BuildSafeFileName(string originalName, string extension)
    {
        var baseName = Path.GetFileNameWithoutExtension(Path.GetFileName(originalName));
        foreach (var c in Path.GetInvalidFileNameChars())
        {
            baseName = baseName.Replace(c, '_');
        }
        if (string.IsNullOrWhiteSpace(baseName))
        {
            baseName = "photo";
        }

        var candidate = baseName + extension;
        var counter = 1;
        while (System.IO.File.Exists(Path.Combine(_photoDirectory, candidate)))
        {
            candidate = $"{baseName}-{counter++}{extension}";
        }
        return candidate;
    }
}
