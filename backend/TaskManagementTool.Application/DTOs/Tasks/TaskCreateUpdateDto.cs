using System.ComponentModel.DataAnnotations;

namespace TaskManagementTool.Application.DTOs.Tasks;

public class TaskCreateUpdateDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }

    [Required]
    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Pending";
    public string? Category { get; set; }
    public string? AssignedUserId { get; set; }
}
