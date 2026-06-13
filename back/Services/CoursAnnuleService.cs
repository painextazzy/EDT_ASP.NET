using AutoMapper;
using back.Data;
using back.DTOs;
using back.Models;
using Microsoft.EntityFrameworkCore;

namespace back.Services
{
    public class CoursAnnuleService : ICoursAnnuleService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public CoursAnnuleService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<CoursAnnuleDto>> GetAllAsync()
        {
            var cours = await _context.CoursAnnules.ToListAsync();
            return _mapper.Map<IEnumerable<CoursAnnuleDto>>(cours);
        }

        public async Task<CoursAnnuleDto?> GetByIdAsync(int id)
        {
            var cours = await _context.CoursAnnules.FindAsync(id);
            return cours == null ? null : _mapper.Map<CoursAnnuleDto>(cours);
        }

        public async Task<CoursAnnuleDto> CreateAsync(CreateCoursAnnuleDto dto)
        {
            var entity = _mapper.Map<CoursAnnule>(dto);
            _context.CoursAnnules.Add(entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<CoursAnnuleDto>(entity);
        }

        public async Task<CoursAnnuleDto?> UpdateAsync(int id, UpdateCoursAnnuleDto dto)
        {
            var entity = await _context.CoursAnnules.FindAsync(id);
            if (entity == null) return null;
            _mapper.Map(dto, entity);
            await _context.SaveChangesAsync();
            return _mapper.Map<CoursAnnuleDto>(entity);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.CoursAnnules.FindAsync(id);
            if (entity == null) return false;
            _context.CoursAnnules.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}