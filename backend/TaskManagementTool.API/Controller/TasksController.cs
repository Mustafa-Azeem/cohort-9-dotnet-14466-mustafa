using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementTool.Application.DTOs.Tasks;
using TaskManagementTool.Application.Interfaces;

namespace TaskManagementTool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    private bool IsAdmin => User.IsInRole("Admin");

    [HttpGet]
    public async Task<IActionResult> GetTasks([FromQuery] string? status, [FromQuery] string? priority, [FromQuery] string? search)
    {
        var tasks = await _taskService.GetTasksAsync(CurrentUserId, IsAdmin, status, priority, search);
        return Ok(tasks);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTaskById(int id)
    {
        var task = await _taskService.GetTaskByIdAsync(id, CurrentUserId, IsAdmin);
        return Ok(task);
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask([FromBody] TaskCreateUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        
        if (!IsAdmin)
            dto.AssignedUserId = CurrentUserId;

        var task = await _taskService.CreateTaskAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id }, task);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskCreateUpdateDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _taskService.UpdateTaskAsync(id, dto, CurrentUserId, IsAdmin);
        return Ok(task);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        await _taskService.DeleteTaskAsync(id, CurrentUserId, IsAdmin);
        return NoContent();
    }

    [HttpGet("dashboard-counts")]
    public async Task<IActionResult> GetDashboardCounts()
    {
        var counts = await _taskService.GetDashboardCountsAsync(CurrentUserId, IsAdmin);
        return Ok(counts);
    }
}
