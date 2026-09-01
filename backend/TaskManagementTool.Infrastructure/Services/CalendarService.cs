using Microsoft.EntityFrameworkCore;
using TaskManagementTool.Application.DTOs.Calendar;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Application.Interfaces;
using TaskManagementTool.Domain.Entities;
using TaskManagementTool.Infrastructure.Data;

namespace TaskManagementTool.Infrastructure.Services;

public class CalendarService : ICalendarService
{
    private readonly AppDbContext _db;

    public CalendarService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CalendarEventDto>> GetEventsAsync(string currentUserId, bool isAdmin, DateTime? from, DateTime? to)
    {
        var query = _db.CalendarEvents.AsQueryable();

        if (!isAdmin)
            query = query.Where(e => e.CreatedByUserId == currentUserId);

        if (from.HasValue)
            query = query.Where(e => e.StartTime >= from.Value);

        if (to.HasValue)
            query = query.Where(e => e.EndTime <= to.Value);

        var events = await query.ToListAsync();

        return events.Select(e => new CalendarEventDto
        {
            Id = e.Id,
            Title = e.Title,
            Description = e.Description,
            StartTime = e.StartTime,
            EndTime = e.EndTime,
            EventType = e.EventType.ToString(),
            CreatedByUserId = e.CreatedByUserId,
            CreatedByUserName = e.CreatedByUserId,
            CreatedAt = e.CreatedAt
        }).ToList();
    }

    public async Task<CalendarEventDto> GetEventByIdAsync(int id, string currentUserId, bool isAdmin)
    {
        var evt = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id);
        if (evt == null)
            throw new ApiException("Event not found", 404);

        if (!isAdmin && evt.CreatedByUserId != currentUserId)
            throw new ApiException("Unauthorized", 403);

        return new CalendarEventDto
        {
            Id = evt.Id,
            Title = evt.Title,
            Description = evt.Description,
            StartTime = evt.StartTime,
            EndTime = evt.EndTime,
            EventType = evt.EventType.ToString(),
            CreatedByUserId = evt.CreatedByUserId,
            CreatedByUserName = evt.CreatedByUserId,
            CreatedAt = evt.CreatedAt
        };
    }

    public async Task<CalendarEventDto> CreateEventAsync(CalendarEventCreateUpdateDto dto, string currentUserId)
    {
        var evt = new CalendarEvent
        {
            Title = dto.Title,
            Description = dto.Description,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            EventType = Enum.Parse<EventType>(dto.EventType, true),
            CreatedByUserId = currentUserId,
            CreatedAt = DateTime.UtcNow
        };

        _db.CalendarEvents.Add(evt);
        await _db.SaveChangesAsync();

        return new CalendarEventDto
        {
            Id = evt.Id,
            Title = evt.Title,
            Description = evt.Description,
            StartTime = evt.StartTime,
            EndTime = evt.EndTime,
            EventType = evt.EventType.ToString(),
            CreatedByUserId = evt.CreatedByUserId,
            CreatedByUserName = evt.CreatedByUserId,
            CreatedAt = evt.CreatedAt
        };
    }

    public async Task<CalendarEventDto> UpdateEventAsync(int id, CalendarEventCreateUpdateDto dto, string currentUserId, bool isAdmin)
    {
        var evt = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id);
        if (evt == null)
            throw new ApiException("Event not found", 404);

        if (!isAdmin && evt.CreatedByUserId != currentUserId)
            throw new ApiException("Unauthorized", 403);

        evt.Title = dto.Title;
        evt.Description = dto.Description;
        evt.StartTime = dto.StartTime;
        evt.EndTime = dto.EndTime;
        evt.EventType = Enum.Parse<EventType>(dto.EventType, true);

        _db.CalendarEvents.Update(evt);
        await _db.SaveChangesAsync();

        return new CalendarEventDto
        {
            Id = evt.Id,
            Title = evt.Title,
            Description = evt.Description,
            StartTime = evt.StartTime,
            EndTime = evt.EndTime,
            EventType = evt.EventType.ToString(),
            CreatedByUserId = evt.CreatedByUserId,
            CreatedByUserName = evt.CreatedByUserId,
            CreatedAt = evt.CreatedAt
        };
    }

    public async Task DeleteEventAsync(int id, string currentUserId, bool isAdmin)
    {
        var evt = await _db.CalendarEvents.FirstOrDefaultAsync(e => e.Id == id);
        if (evt == null)
            throw new ApiException("Event not found", 404);

        if (!isAdmin && evt.CreatedByUserId != currentUserId)
            throw new ApiException("Unauthorized", 403);

        _db.CalendarEvents.Remove(evt);
        await _db.SaveChangesAsync();
    }
}
