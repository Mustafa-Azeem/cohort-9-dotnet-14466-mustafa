using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TaskManagementTool.Application.DTOs.Tasks;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Application.Interfaces;
using TaskManagementTool.Domain.Entities;
using TaskManagementTool.Infrastructure.Data;

namespace TaskManagementTool.Infrastructure.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _db;
    private readonly ILogger<TaskService> _logger;

    public TaskService(AppDbContext db, ILogger<TaskService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<List<TaskDto>> GetTasksAsync(string currentUserId, bool isAdmin, string? status, string? priority, string? search)
    {
        var query = _db.Tasks.Include(t => t.AssignedUser).AsQueryable();

        if (!isAdmin)
            query = query.Where(t => t.AssignedUserId == currentUserId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<JobStatus>(status, true, out var statusEnum))
            query = query.Where(t => t.Status == statusEnum);

        if (!string.IsNullOrWhiteSpace(priority) && Enum.TryParse<TaskPriority>(priority, true, out var priorityEnum))
            query = query.Where(t => t.Priority == priorityEnum);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search));

        var tasks = await query.OrderByDescending(t => t.CreatedAt).ToListAsync();

        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDto> GetTaskByIdAsync(int id, string currentUserId, bool isAdmin)
    {
        var task = await _db.Tasks.Include(t => t.AssignedUser).FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            throw new ApiException("Task not found", 404);

        if (!isAdmin && task.AssignedUserId != currentUserId)
            throw new ApiException("You don't have access to this task", 403);

        return MapToDto(task);
    }

    public async Task<TaskDto> CreateTaskAsync(TaskCreateUpdateDto dto, string currentUserId)
    {
        Enum.TryParse<TaskPriority>(dto.Priority, true, out var priority);
        Enum.TryParse<JobStatus>(dto.Status, true, out var status);

        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Priority = priority,
            Status = status,
            Category = dto.Category,
            AssignedUserId = string.IsNullOrEmpty(dto.AssignedUserId) ? currentUserId : dto.AssignedUserId,
            CreatedByUserId = currentUserId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        _logger.LogInformation("Task created: {TaskId} by {UserId}", task.Id, currentUserId);

        var saved = await _db.Tasks.Include(t => t.AssignedUser).FirstAsync(t => t.Id == task.Id);
        return MapToDto(saved);
    }

    public async Task<TaskDto> UpdateTaskAsync(int id, TaskCreateUpdateDto dto, string currentUserId, bool isAdmin)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null)
            throw new ApiException("Task not found", 404);

        if (!isAdmin && task.AssignedUserId != currentUserId)
            throw new ApiException("You don't have access to this task", 403);

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.DueDate = dto.DueDate;
        task.Category = dto.Category;
        task.UpdatedAt = DateTime.UtcNow;

        if (Enum.TryParse<TaskPriority>(dto.Priority, true, out var priority))
            task.Priority = priority;

        if (Enum.TryParse<JobStatus>(dto.Status, true, out var status))
            task.Status = status;

        if (isAdmin && !string.IsNullOrEmpty(dto.AssignedUserId))
            task.AssignedUserId = dto.AssignedUserId;

        await _db.SaveChangesAsync();

        _logger.LogInformation("Task updated: {TaskId} by {UserId}", task.Id, currentUserId);

        // reload with the (possibly new) assigned user included so the response is accurate
        var updated = await _db.Tasks.Include(t => t.AssignedUser).FirstAsync(t => t.Id == task.Id);
        return MapToDto(updated);
    }

    public async Task DeleteTaskAsync(int id, string currentUserId, bool isAdmin)
    {
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id);
        if (task == null)
            throw new ApiException("Task not found", 404);

        if (!isAdmin && task.AssignedUserId != currentUserId)
            throw new ApiException("You don't have access to this task", 403);

        task.IsDeleted = true;
        await _db.SaveChangesAsync();

        _logger.LogInformation("Task soft-deleted: {TaskId} by {UserId}", task.Id, currentUserId);
    }

    public async Task<DashboardCountsDto> GetDashboardCountsAsync(string currentUserId, bool isAdmin)
    {
        var query = _db.Tasks.AsQueryable();
        if (!isAdmin)
            query = query.Where(t => t.AssignedUserId == currentUserId);

        var grouped = await query
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return new DashboardCountsDto
        {
            Pending = grouped.FirstOrDefault(g => g.Status == JobStatus.Pending)?.Count ?? 0,
            InProgress = grouped.FirstOrDefault(g => g.Status == JobStatus.InProgress)?.Count ?? 0,
            Completed = grouped.FirstOrDefault(g => g.Status == JobStatus.Completed)?.Count ?? 0
        };
    }

    private static TaskDto MapToDto(TaskItem task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            Priority = task.Priority.ToString(),
            Status = task.Status.ToString(),
            Category = task.Category,
            AssignedUserId = task.AssignedUserId,
            AssignedUserName = task.AssignedUser?.FullName ?? "Unknown",
            CreatedAt = task.CreatedAt
        };
    }
}