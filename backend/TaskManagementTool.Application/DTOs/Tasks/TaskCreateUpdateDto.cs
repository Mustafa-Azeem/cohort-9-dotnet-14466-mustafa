using System.ComponentModel.DataAnnotations;
using TaskManagementTool.Domain.Entities;

namespace TaskManagementTool.Application.DTOs.Tasks;

public class TaskCreateUpdateDto : IValidatableObject
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }

    [Required]
    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Pending";
    public string? Category { get; set; }

    // admin can assign to anyone, regular user this just stays as themselves
    public string? AssignedUserId { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (!Enum.TryParse<TaskPriority>(Priority, true, out var priority) || !Enum.IsDefined(priority))
            yield return new ValidationResult($"Priority must be one of: {string.Join(", ", Enum.GetNames(typeof(TaskPriority)))}", new[] { nameof(Priority) });

        if (!Enum.TryParse<JobStatus>(Status, true, out var status) || !Enum.IsDefined(status))
            yield return new ValidationResult($"Status must be one of: {string.Join(", ", Enum.GetNames(typeof(JobStatus)))}", new[] { nameof(Status) });
    }
}