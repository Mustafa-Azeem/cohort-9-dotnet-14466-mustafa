using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Application.Interfaces;
using TaskManagementTool.Domain.Entities;
using TaskManagementTool.Infrastructure.Data;
using TaskManagementTool.Infrastructure.Services;
using Xunit;

namespace TaskManagementTool.Tests;

// no-op audit logger for tests - we're not asserting on audit behavior here
public class FakeAuditService : IAuditService
{
    public Task LogAsync(string userId, string action, string? details = null) => Task.CompletedTask;
}

public class TaskServiceTests : IDisposable
{
    private readonly List<SqliteConnection> _connections = new();

    private AppDbContext GetDbContext()
    {
        var connection = new SqliteConnection("Filename=:memory:");
        connection.Open();
        _connections.Add(connection);

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .Options;

        var db = new AppDbContext(options);
        db.Database.EnsureCreated();
        return db;
    }

    private static TaskService GetService(AppDbContext db) =>
        new(db, NullLogger<TaskService>.Instance, new FakeAuditService());

    public void Dispose()
    {
        foreach (var connection in _connections)
            connection.Dispose();
    }

    [Fact]
    public async Task CreateTaskAsync_ShouldSaveTask_ForRegularUser()
    {
        var db = GetDbContext();
        db.Users.Add(new ApplicationUser { Id = "user1", FullName = "Test User", Email = "u@test.com" });
        await db.SaveChangesAsync();

        var service = GetService(db);

        var dto = new Application.DTOs.Tasks.TaskCreateUpdateDto
        {
            Title = "Finish report",
            Priority = "High",
            Status = "Pending"
        };

        var result = await service.CreateTaskAsync(dto, "user1");

        Assert.Equal("Finish report", result.Title);
        Assert.Equal("user1", result.AssignedUserId);
    }

    [Fact]
    public async Task GetTasksAsync_RegularUser_OnlySeesOwnTasks()
    {
        var db = GetDbContext();
        db.Users.Add(new ApplicationUser { Id = "user1", FullName = "User One" });
        db.Users.Add(new ApplicationUser { Id = "user2", FullName = "User Two" });
        db.Tasks.Add(new TaskItem { Title = "Task A", AssignedUserId = "user1", CreatedByUserId = "user1" });
        db.Tasks.Add(new TaskItem { Title = "Task B", AssignedUserId = "user2", CreatedByUserId = "user2" });
        await db.SaveChangesAsync();

        var service = GetService(db);

        var tasks = await service.GetTasksAsync("user1", isAdmin: false, null, null, null);

        Assert.Single(tasks);
        Assert.Equal("Task A", tasks[0].Title);
    }

    [Fact]
    public async Task GetTasksAsync_Admin_SeesAllTasks()
    {
        var db = GetDbContext();
        db.Users.Add(new ApplicationUser { Id = "user1", FullName = "User One" });
        db.Users.Add(new ApplicationUser { Id = "user2", FullName = "User Two" });
        db.Tasks.Add(new TaskItem { Title = "Task A", AssignedUserId = "user1", CreatedByUserId = "user1" });
        db.Tasks.Add(new TaskItem { Title = "Task B", AssignedUserId = "user2", CreatedByUserId = "user2" });
        await db.SaveChangesAsync();

        var service = GetService(db);

        var tasks = await service.GetTasksAsync("admin1", isAdmin: true, null, null, null);

        Assert.Equal(2, tasks.Count);
    }

    [Fact]
    public async Task DeleteTaskAsync_RegularUser_CannotDeleteOthersTask()
    {
        var db = GetDbContext();
        db.Users.Add(new ApplicationUser { Id = "user1", FullName = "User One" });
        db.Users.Add(new ApplicationUser { Id = "user2", FullName = "User Two" });
        db.Tasks.Add(new TaskItem { Id = 1, Title = "Task A", AssignedUserId = "user1", CreatedByUserId = "user1" });
        await db.SaveChangesAsync();

        var service = GetService(db);

        await Assert.ThrowsAsync<ApiException>(() =>
            service.DeleteTaskAsync(1, "user2", isAdmin: false));
    }

    [Fact]
    public async Task DeleteTaskAsync_SoftDeletes_DoesNotRemoveFromDb()
    {
        var db = GetDbContext();
        db.Users.Add(new ApplicationUser { Id = "user1", FullName = "User One" });
        db.Tasks.Add(new TaskItem { Id = 1, Title = "Task A", AssignedUserId = "user1", CreatedByUserId = "user1" });
        await db.SaveChangesAsync();

        var service = GetService(db);
        await service.DeleteTaskAsync(1, "user1", isAdmin: false);

        var stillExists = await db.Tasks.IgnoreQueryFilters().AnyAsync(t => t.Id == 1);
        Assert.True(stillExists);
    }

    [Fact]
    public async Task GetDashboardCountsAsync_ReturnsCorrectGrouping()
    {
        var db = GetDbContext();
        db.Users.Add(new ApplicationUser { Id = "u1", FullName = "User One" });
        db.Tasks.Add(new TaskItem { Title = "A", AssignedUserId = "u1", Status = TaskManagementTool.Domain.Entities.JobStatus.Pending });
        db.Tasks.Add(new TaskItem { Title = "B", AssignedUserId = "u1", Status = TaskManagementTool.Domain.Entities.JobStatus.Completed });
        db.Tasks.Add(new TaskItem { Title = "C", AssignedUserId = "u1", Status = TaskManagementTool.Domain.Entities.JobStatus.Completed });
        await db.SaveChangesAsync();

        var service = GetService(db);
        var counts = await service.GetDashboardCountsAsync("u1", isAdmin: false);

        Assert.Equal(1, counts.Pending);
        Assert.Equal(2, counts.Completed);
        Assert.Equal(0, counts.InProgress);
    }
}
