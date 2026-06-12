using back.DTOs;

namespace back.Services
{
    public interface ICoursAnnuleService
    {
        Task<IEnumerable<CoursAnnuleDto>> GetAllAsync();
        Task<CoursAnnuleDto?> GetByIdAsync(int id);
        Task<CoursAnnuleDto> CreateAsync(CreateCoursAnnuleDto dto);
        Task<CoursAnnuleDto?> UpdateAsync(int id, UpdateCoursAnnuleDto dto);
        Task<bool> DeleteAsync(int id);
    }
}