// Controllers/EmailController.cs
using Microsoft.AspNetCore.Mvc;
using back.Services;
using back.Models;

namespace back.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "EmailController est accessible !" });
    }

    [HttpPost("send-test")]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.ToEmail))
            return BadRequest(new { success = false, message = "L'adresse email est requise." });

        var emailRequest = new EmailRequest
        {
            To = request.ToEmail,
            Subject = request.Subject ?? "Test depuis l'application",
            HtmlContent = request.HtmlContent ?? "<h1>Test réussi !</h1><p>Votre service d'email fonctionne correctement.</p>"
        };

        try
        {
            bool success = await _emailService.SendEmailAsync(emailRequest);
            return Ok(new { success, message = success ? "Email envoyé avec succès" : "Échec de l'envoi" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

public class TestEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? HtmlContent { get; set; }
}