using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Unicode;
using Microsoft.AspNetCore.Hosting;
using WanluanDmapApi.Interfaces;
using WanluanDmapApi.Models;

namespace WanluanDmapApi.Services;

public class RoadHazardService : IRoadHazardService
{
    private readonly ILogger<RoadHazardService> _logger;
    private readonly object _lock = new();
    private readonly string _filePath;
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        // Keep Chinese text (incl. full-width punctuation) readable in the committed
        // JSON file instead of \uXXXX escapes.
        Encoder = JavaScriptEncoder.Create(
            UnicodeRanges.BasicLatin,
            UnicodeRanges.CjkUnifiedIdeographs,
            UnicodeRanges.CjkSymbolsandPunctuation,
            UnicodeRanges.HalfwidthandFullwidthForms)
    };
    private List<RoadHazard> _hazards = new();

    public RoadHazardService(IConfiguration configuration, IWebHostEnvironment env, ILogger<RoadHazardService> logger)
    {
        _logger = logger;

        var configuredPath = configuration["DataFilePath"] ?? "../frontend/public/data/roadHazards.json";
        _filePath = Path.GetFullPath(Path.Combine(env.ContentRootPath, configuredPath));

        LoadFromFile();
    }

    private void LoadFromFile()
    {
        try
        {
            var directory = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }

            if (!File.Exists(_filePath))
            {
                _hazards = new List<RoadHazard>();
                SaveToFile();
                _logger.LogInformation("Data file not found, created new empty file at {Path}", _filePath);
                return;
            }

            var json = File.ReadAllText(_filePath);
            _hazards = JsonSerializer.Deserialize<List<RoadHazard>>(json, _jsonOptions) ?? new List<RoadHazard>();
            _logger.LogInformation("Loaded {Count} road hazards from {Path}", _hazards.Count, _filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load road hazards from {Path}", _filePath);
            _hazards = new List<RoadHazard>();
        }
    }

    private void SaveToFile()
    {
        var json = JsonSerializer.Serialize(_hazards, _jsonOptions);
        File.WriteAllText(_filePath, json);
    }

    public Task<List<RoadHazard>> GetAllAsync()
    {
        lock (_lock)
        {
            return Task.FromResult(_hazards.OrderByDescending(h => h.UpdatedAt).ToList());
        }
    }

    public Task<RoadHazard?> GetByIdAsync(int id)
    {
        lock (_lock)
        {
            return Task.FromResult(_hazards.FirstOrDefault(h => h.Id == id));
        }
    }

    public Task<RoadHazard> CreateAsync(RoadHazard entity)
    {
        try
        {
            lock (_lock)
            {
                entity.Id = _hazards.Count == 0 ? 1 : _hazards.Max(h => h.Id) + 1;
                entity.ReportedAt = DateTime.Now;
                entity.UpdatedAt = DateTime.Now;
                _hazards.Add(entity);
                SaveToFile();
            }
            _logger.LogInformation("Created road hazard {Id}", entity.Id);
            return Task.FromResult(entity);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create road hazard");
            throw;
        }
    }

    public Task<bool> UpdateAsync(RoadHazard entity)
    {
        try
        {
            lock (_lock)
            {
                var existing = _hazards.FirstOrDefault(h => h.Id == entity.Id);
                if (existing == null)
                {
                    return Task.FromResult(false);
                }

                existing.Location = entity.Location;
                existing.Latitude = entity.Latitude;
                existing.Longitude = entity.Longitude;
                existing.HazardType = entity.HazardType;
                existing.Severity = entity.Severity;
                existing.Status = entity.Status;
                existing.Description = entity.Description;
                existing.Photo = entity.Photo;
                existing.UpdatedAt = DateTime.Now;
                SaveToFile();
            }
            _logger.LogInformation("Updated road hazard {Id}", entity.Id);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update road hazard {Id}", entity.Id);
            throw;
        }
    }

    public Task<bool> DeleteAsync(int id)
    {
        try
        {
            lock (_lock)
            {
                var existing = _hazards.FirstOrDefault(h => h.Id == id);
                if (existing == null)
                {
                    return Task.FromResult(false);
                }

                _hazards.Remove(existing);
                SaveToFile();
            }
            _logger.LogInformation("Deleted road hazard {Id}", id);
            return Task.FromResult(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete road hazard {Id}", id);
            throw;
        }
    }
}
