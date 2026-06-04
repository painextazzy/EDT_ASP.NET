// Controllers/BackupController.cs
using Microsoft.AspNetCore.Mvc;
using back.Services;

namespace back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BackupController : ControllerBase
    {
        private readonly IDatabaseBackupService _backupService;

        public BackupController(IDatabaseBackupService backupService)
        {
            _backupService = backupService;
        }

        [HttpPost("export")]
        public async Task<IActionResult> ExportTables([FromBody] BackupConfig config)
        {
            try
            {
                var fileBytes = await _backupService.ExportTablesAsync(config);
                var fileName = $"{config.FileName ?? $"export_{DateTime.Now:yyyyMMdd_HHmmss}"}.json";

                return File(fileBytes, "application/json", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportFromJson(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "Aucun fichier fourni" });

                if (!file.FileName.EndsWith(".json"))
                    return BadRequest(new { success = false, message = "Format non supporté. Utilisez .json" });

                var result = await _backupService.ImportFromJsonAsync(file);

                if (result.Success)
                    return Ok(result);
                else
                    return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}