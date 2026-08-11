namespace TaskManagementTool.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public string? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    
    public string AssignedUserId { get; set; } = string.Empty;
    public ApplicationUser? AssignedUser { get; set; }

    
    public string CreatedByUserId { get; set; } = string.Empty;

    public bool IsDeleted { get; set; } = false; 
}