using WanluanDmapApi.Common;
using WanluanDmapApi.Interfaces;
using WanluanDmapApi.Models;

namespace WanluanDmapApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoadHazardController : ControllerBase
{
    private readonly ILogger<RoadHazardController> _logger;
    private readonly IRoadHazardService _roadHazardService;

    public RoadHazardController(ILogger<RoadHazardController> logger, IRoadHazardService roadHazardService)
    {
        _logger = logger;
        _roadHazardService = roadHazardService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var data = await _roadHazardService.GetAllAsync();
            return Ok(new ApiResult<List<RoadHazard>>(data));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetAll failed");
            return StatusCode(500, new ApiError("5000", ex.Message));
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var data = await _roadHazardService.GetByIdAsync(id);
            if (data == null)
            {
                return NotFound(new ApiError("4040", $"RoadHazard {id} not found"));
            }
            return Ok(new ApiResult<RoadHazard>(data));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetById failed for {Id}", id);
            return StatusCode(500, new ApiError("5000", ex.Message));
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RoadHazard entity)
    {
        try
        {
            var created = await _roadHazardService.CreateAsync(entity);
            return Ok(new ApiResult<RoadHazard>(created));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create failed");
            return StatusCode(500, new ApiError("5000", ex.Message));
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] RoadHazard entity)
    {
        try
        {
            entity.Id = id;
            var success = await _roadHazardService.UpdateAsync(entity);
            if (!success)
            {
                return NotFound(new ApiError("4040", $"RoadHazard {id} not found"));
            }
            return Ok(new ApiResult<bool>(true));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update failed for {Id}", id);
            return StatusCode(500, new ApiError("5000", ex.Message));
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _roadHazardService.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new ApiError("4040", $"RoadHazard {id} not found"));
            }
            return Ok(new ApiResult<bool>(true));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Delete failed for {Id}", id);
            return StatusCode(500, new ApiError("5000", ex.Message));
        }
    }
}
