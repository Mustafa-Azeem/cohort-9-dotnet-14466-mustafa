using System.ComponentModel.DataAnnotations;
using TaskManagementTool.Domain.Entities;

namespace TaskManagementTool.Application.DTOs.Calendar;

public class CalendarEventCreateUpdateDto : IValidatableObject
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }

    [Required]
    public string EventType { get; set; } = "Other";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!Enum.TryParse<EventType>(EventType, true, out var type) || !Enum.IsDefined(type))
            yield return new ValidationResult(
                $"EventType must be one of: {string.Join(", ", Enum.GetNames(typeof(EventType)))}",
                new[] { nameof(EventType) });

        if (EndTime <= StartTime)
            yield return new ValidationResult("EndTime must be after StartTime", new[] { nameof(EndTime) });
    }
}
