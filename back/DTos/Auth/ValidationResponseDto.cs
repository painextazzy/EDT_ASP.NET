// Dto/Auth/ValidationResponseDto.cs
namespace back.DTos.Auth
{
    public class ValidationResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}