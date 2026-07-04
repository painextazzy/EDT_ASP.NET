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

    // 🔹 Endpoint de test pour vérifier que le contrôleur répond
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "EmailController est accessible !" });
    }

    // 🔹 Endpoint d’envoi d’email
    [HttpPost("send-test")]
    public async Task<IActionResult> SendTestEmail([FromBody] TestEmailRequest request)
    {
        // Validation basique
        if (request == null || string.IsNullOrWhiteSpace(request.ToEmail))
            return BadRequest(new { success = false, message = "L'adresse email est requise." });

        // Construction de la demande pour le service
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
            // En cas d'erreur interne (ex: clé API manquante)
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

// DTO pour la requête entrante
public class TestEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string? Subject { get; set; }
    public string? HtmlContent { get; set; }
}