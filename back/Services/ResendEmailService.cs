// Services/ResendEmailService.cs
using System.Text;
using System.Text.Json;
using back.Models;

namespace back.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(HttpClient httpClient, ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(EmailRequest request)
    {
        var apiKey = Environment.GetEnvironmentVariable("RESEND_API_KEY");
        var fromEmail = Environment.GetEnvironmentVariable("RESEND_FROM_EMAIL");
        var fromName = Environment.GetEnvironmentVariable("RESEND_FROM_NAME") ?? "Votre Établissement";

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("RESEND_API_KEY manquante dans .env");
            return false;
        }

        if (string.IsNullOrWhiteSpace(fromEmail))
        {
            _logger.LogError("RESEND_FROM_EMAIL manquante dans .env");
            return false;
        }

        // Construction du payload Resend
        var payload = new
        {
            from = $"{fromName} <{fromEmail}>",
            to = new[] { request.To },
            subject = request.Subject ?? "Message de l'application",
            html = request.HtmlContent ?? "<p>Message par défaut</p>"
        };

        var json = JsonSerializer.Serialize(payload);
        using var message = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");
        message.Headers.Add("Authorization", $"Bearer {apiKey}");
        message.Content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.SendAsync(message);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation($"Resend status: {response.StatusCode} - {responseBody}");

            if (response.IsSuccessStatusCode)
                return true;

            // Log détaillé en cas d'échec
            _logger.LogError($"Erreur Resend: {responseBody}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception lors de l'appel à Resend");
            return false;
        }
    }
}