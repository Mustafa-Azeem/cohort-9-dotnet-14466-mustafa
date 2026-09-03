using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManagementTool.Application.DTOs.Users;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Domain.Entities;
using System.Collections.Generic;

namespace TaskManagementTool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    
    private readonly UserManager<ApplicationUser> _userManager;

    public UsersController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var usersList = _userManager.Users.ToList();
        var result = new List<UserDto>();

        foreach (var u in usersList)
        {
            var roles = await _userManager.GetRolesAsync(u);
            var role = roles.FirstOrDefault() ?? "User";
            result.Add(new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email ?? string.Empty,
                Role = role
            });
        }

        return Ok(result);
    }

    [HttpPost("{id}/promote")]
    public async Task<IActionResult> PromoteToAdmin(string id)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (callerId == id)
            throw new ApiException("You cannot change your own role", 400);

        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new ApiException("User not found", 404);

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Contains("Admin"))
            throw new ApiException("User is already an Admin", 409);

        if (roles.Contains("User"))
        {
            var rem = await _userManager.RemoveFromRoleAsync(user, "User");
            if (!rem.Succeeded)
                throw new ApiException(string.Join("; ", rem.Errors.Select(e => e.Description)), 500);
        }

        var add = await _userManager.AddToRoleAsync(user, "Admin");
        if (!add.Succeeded)
            throw new ApiException(string.Join("; ", add.Errors.Select(e => e.Description)), 500);

        return NoContent();
    }
}
