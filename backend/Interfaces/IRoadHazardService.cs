using WanluanDmapApi.Models;

namespace WanluanDmapApi.Interfaces;

public interface IRoadHazardService
{
    Task<List<RoadHazard>> GetAllAsync();
    Task<RoadHazard?> GetByIdAsync(int id);
    Task<RoadHazard> CreateAsync(RoadHazard entity);
    Task<bool> UpdateAsync(RoadHazard entity);
    Task<bool> DeleteAsync(int id);
}
