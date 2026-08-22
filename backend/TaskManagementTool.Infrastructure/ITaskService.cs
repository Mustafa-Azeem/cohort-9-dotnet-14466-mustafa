using TaskManagementTool.Application.DTOs.Tasks;

namespace TaskManagementTool.Application.Interfaces;

public interface ITaskService
{
    Task<List<TaskDto>> GetTasksAsync(string currentUserId, bool isAdmin, string? status, string? priority, string? search);
    Task<TaskDto> GetTaskByIdAsync(int id, string currentUserId, bool isAdmin);
    Task<TaskDto> CreateTaskAsync(TaskCreateUpdateDto dto, string currentUserId);
    Task<TaskDto> UpdateTaskAsync(int id, TaskCreateUpdateDto dto, string currentUserId, bool isAdmin);
    Task DeleteTaskAsync(int id, string currentUserId, bool isAdmin);
    Task<DashboardCountsDto> GetDashboardCountsAsync(string currentUserId, bool isAdmin);
}
