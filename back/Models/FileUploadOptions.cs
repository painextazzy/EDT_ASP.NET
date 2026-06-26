// Models/FileUploadOptions.cs
namespace back.Models
{
    public class FileUploadOptions
    {
        public long MaxSizeInBytes { get; set; } = 5242880; // 5MB
        public string[] AllowedExtensions { get; set; } = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        public string UploadPath { get; set; } = "wwwroot/images/uploads";
        public string DefaultAvatarPath { get; set; } = "/images/avatars/default-avatar.png";
    }
}