using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementTool.Application.DTOs.Calendar;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Application.Interfaces;

namespace TaskManagementTool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarController : ControllerBase
{
    private readonly ICalendarService _calendarService;

    public CalendarController(ICalendarService calendarService)
    {
        _calendarService = calendarService;
    }

    private string CurrentUserId
    {
        get
        {
            var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(id))
                throw new ApiException("Not authenticated", 401);
            return id;
        }
    }

    private bool IsAdmin => User.IsInRole("Admin");

    [HttpGet]
    public async Task<IActionResult> GetEvents([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var events = await _calendarService.GetEventsAsync(CurrentUserId, IsAdmin, from, to);
        return Ok(events);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEventById(int id)
    {
        var evt = await _calendarService.GetEventByIdAsync(id, CurrentUserId, IsAdmin);
        return Ok(evt);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent([FromBody] CalendarEventCreateUpdateDto dto)
    {
        var evt = await _calendarService.CreateEventAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetEventById), new { id = evt.Id }, evt);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEvent(int id, [FromBody] CalendarEventCreateUpdateDto dto)
    {
        var evt = await _calendarService.UpdateEventAsync(id, dto, CurrentUserId, IsAdmin);
        return Ok(evt);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        await _calendarService.DeleteEventAsync(id, CurrentUserId, IsAdmin);
        return NoContent();
    }
}
