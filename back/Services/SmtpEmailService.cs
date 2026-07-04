// Services/SmtpEmailService.cs
using System.Net;
using System.Net.Mail;
using back.Models;

namespace back.Services;

public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(ILogger<SmtpEmailService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(EmailRequest request)
    {
        var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? "smtp.gmail.com";
        var port = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
        var username = Environment.GetEnvironmentVariable("SMTP_USERNAME");
        var password = Environment.GetEnvironmentVariable("SMTP_PASSWORD");
        var fromEmail = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? username;
        var fromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? "Votre Établissement";
        var enableSsl = bool.TryParse(Environment.GetEnvironmentVariable("SMTP_ENABLE_SSL"), out var ssl) ? ssl : true;

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogError("SMTP_USERNAME ou SMTP_PASSWORD manquants dans .env");
            return false;
        }

        using var client = new SmtpClient(host, port);
        client.EnableSsl = enableSsl;
        client.Credentials = new NetworkCredential(username, password);

        var mail = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = request.Subject ?? "Message de l'application",
            Body = request.HtmlContent ?? "<p>Message par défaut</p>",
            IsBodyHtml = true
        };
        mail.To.Add(request.To);

        try
        {
            await client.SendMailAsync(mail);
            _logger.LogInformation($"Email envoyé à {request.To}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erreur SMTP lors de l'envoi à {request.To}");
            return false;
        }
    }
}