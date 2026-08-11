using Microsoft.AspNetCore.Identity;

namespace TaskManagementTool.Domain.Entities;

// extends Identity's default user, adding a couple extra fields we actually need
public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // nav prop - tasks assigned to this user
    public ICollection<TaskItem> AssignedTasks { get; set; } = new List<TaskItem>();
}