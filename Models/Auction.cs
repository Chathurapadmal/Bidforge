namespace Bidforge.Models;

public class Auction
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Primary (legacy) single image filename, e.g. "foo.jpg"
    public string? Image { get; set; }

    // Stored as JSON text in DB; see AppDbContext converter.
    public string? ImagesJson { get; set; }

    public decimal CurrentBid { get; set; }

    // UTC
    public DateTime? EndTime { get; set; }

    public string? Badge { get; set; }

    // UTC
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Convenience helpers (not mapped)
    public IEnumerable<string> GetImages()
    {
        if (string.IsNullOrWhiteSpace(ImagesJson)) return Enumerable.Empty<string>();
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<string[]>(ImagesJson!) ?? Array.Empty<string>();
        }
        catch { return Enumerable.Empty<string>(); }
    }

    public void SetImages(IEnumerable<string> images)
    {
        ImagesJson = System.Text.Json.JsonSerializer.Serialize(images?.Where(s => !string.IsNullOrWhiteSpace(s)) ?? Array.Empty<string>());
    }

    // Nav
    public ICollection<Bid>? Bids { get; set; }
}
