using GestionSalles.API.DTOs;

namespace GestionSalles.API.Services;

public interface ISalleService
{
    Task<IEnumerable<SalleDto>> GetAllAsync(string? batiment, int? etage, string? search);
    Task<SalleDto?> GetByIdAsync(int id);
    Task<IEnumerable<string>> GetBatimentsAsync();
    Task<IEnumerable<int>> GetEtagesAsync();
    Task<SalleDto> CreateAsync(CreateSalleDto dto);
    Task<SalleDto?> UpdateAsync(int id, UpdateSalleDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> ExistsAsync(string nomSalle, string batiment, int? excludeId = null);
}