// Controllers/CoursAnnulesController.cs
using Microsoft.AspNetCore.Mvc;
using back.DTOs;
using back.Services;

namespace back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoursAnnulesController : ControllerBase
    {
        private readonly ICoursAnnuleService _service;

        public CoursAnnulesController(ICoursAnnuleService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var cours = await _service.GetAllAsync();
            return Ok(cours);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var cours = await _service.GetByIdAsync(id);
            if (cours == null) return NotFound();
            return Ok(cours);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateCoursAnnuleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCoursAnnuleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}