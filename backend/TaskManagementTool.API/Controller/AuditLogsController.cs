using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementTool.Application.DTOs.Audit;
using TaskManagementTool.Infrastructure.Data;

namespace TaskManagementTool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuditLogsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetRecent()
    {
        // join against Users so we can show a name instead of a raw id, most recent first
        var logs = await (
            from log in _db.AuditLogs
            join user in _db.Users on log.UserId equals user.Id into userJoin
            from user in userJoin.DefaultIfEmpty()
            orderby log.Timestamp descending
            select new AuditLogDto
            {
                Id = log.Id,
                UserId = log.UserId,
                UserName = user != null ? user.FullName : "Unknown",
                Action = log.Action,
                Details = log.Details,
                Timestamp = log.Timestamp
            })
            .Take(100)
            .ToListAsync();

        return Ok(logs);
    }
}
