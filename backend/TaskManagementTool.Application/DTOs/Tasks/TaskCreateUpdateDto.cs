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
        if (!Enum.TryParse<TaskPriority>(Priority, true, out _) || !Enum.IsDefined(typeof(TaskPriority), Enum.Parse<TaskPriority>(Priority, true)))
            yield return new ValidationResult($"Priority must be one of: {string.Join(", ", Enum.GetNames(typeof(TaskPriority)))}", new[] { nameof(Priority) });

        if (!Enum.TryParse<JobStatus>(Status, true, out _) || !Enum.IsDefined(typeof(JobStatus), Enum.Parse<JobStatus>(Status, true)))
            yield return new ValidationResult($"Status must be one of: {string.Join(", ", Enum.GetNames(typeof(JobStatus)))}", new[] { nameof(Status) });
    }
}