namespace WanluanDmapApi.Models;

public class RoadHazard
{
    public int Id { get; set; }
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // Flooding | Landslide | RoadClosed | Other
    public string HazardType { get; set; } = string.Empty;

    // Light | Moderate | Severe
    public string Severity { get; set; } = string.Empty;

    // Active | Resolved
    public string Status { get; set; } = "Active";

    public string? Description { get; set; }
    public DateTime ReportedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
