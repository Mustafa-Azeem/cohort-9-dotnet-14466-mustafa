using TaskManagementTool.Application.Interfaces;
using TaskManagementTool.Domain.Entities;
using TaskManagementTool.Infrastructure.Data;

namespace TaskManagementTool.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _db;

    public AuditService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string userId, string action, string? details = null)
    {
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = action,
            Details = details
        });

        await _db.SaveChangesAsync();
    }
}
