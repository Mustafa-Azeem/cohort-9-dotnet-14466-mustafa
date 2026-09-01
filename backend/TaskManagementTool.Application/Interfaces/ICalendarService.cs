using TaskManagementTool.Application.DTOs.Calendar;

namespace TaskManagementTool.Application.Interfaces;

public interface ICalendarService
{
    Task<List<CalendarEventDto>> GetEventsAsync(string currentUserId, bool isAdmin, DateTime? from, DateTime? to);
    Task<CalendarEventDto> GetEventByIdAsync(int id, string currentUserId, bool isAdmin);
    Task<CalendarEventDto> CreateEventAsync(CalendarEventCreateUpdateDto dto, string currentUserId);
    Task<CalendarEventDto> UpdateEventAsync(int id, CalendarEventCreateUpdateDto dto, string currentUserId, bool isAdmin);
    Task DeleteEventAsync(int id, string currentUserId, bool isAdmin);
}
