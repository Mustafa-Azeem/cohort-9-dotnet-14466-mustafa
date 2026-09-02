namespace TaskManagementTool.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string userId, string action, string? details = null);
}
