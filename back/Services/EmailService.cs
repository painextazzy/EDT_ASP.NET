// Services/EmailService.cs
using System.Text;
using System.Text.Json;
using back.Models;

namespace back.Services;

public class EmailService : IEmailService
{
    private readonly HttpClient _httpClient;

    public EmailService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> SendEmailAsync(EmailRequest request)
    {
        var apiKey = Environment.GetEnvironmentVariable("BREVO_API_KEY");
        var senderEmail = Environment.GetEnvironmentVariable("BREVO_SENDER_EMAIL");
        var senderName = Environment.GetEnvironmentVariable("BREVO_SENDER_NAME");

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("BREVO_API_KEY introuvable dans .env");

        var body = new
        {
            sender = new { name = senderName, email = senderEmail },
            to = new[] { new { email = request.To } },
            subject = request.Subject,
            htmlContent = request.HtmlContent
        };

        var json = JsonSerializer.Serialize(body);
        using var message = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
        message.Headers.Add("api-key", apiKey);
        message.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(message);
        var responseBody = await response.Content.ReadAsStringAsync();

        // 📝 Log de la réponse Brevo (utile pour déboguer)
        Console.WriteLine($"Brevo status: {response.StatusCode}");
        Console.WriteLine($"Brevo body: {responseBody}");

        if (!response.IsSuccessStatusCode)
        {
            // Log l'erreur pour analyse
            Console.WriteLine($"❌ Erreur Brevo: {responseBody}");
        }

        return response.IsSuccessStatusCode;
    }
}