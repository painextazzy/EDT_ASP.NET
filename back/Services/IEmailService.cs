// Services/IEmailService.cs
using back.Models;

namespace back.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(EmailRequest request);
}