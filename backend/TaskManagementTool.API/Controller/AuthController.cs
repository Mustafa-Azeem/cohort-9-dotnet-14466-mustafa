using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementTool.Application.DTOs.Auth;
using TaskManagementTool.Application.Interfaces;

namespace TaskManagementTool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _env;

    public AuthController(IAuthService authService, IWebHostEnvironment env)
    {
        _authService = authService;
        _env = env;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.RegisterAsync(request);
        SetAuthCookie(result.Token, result.ExpiresAt);
        return Ok(ToUserInfo(result));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _authService.LoginAsync(request);
        SetAuthCookie(result.Token, result.ExpiresAt);
        return Ok(ToUserInfo(result));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("access_token");
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var name = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
        var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

        return Ok(new UserInfoDto
        {
            UserId = userId,
            FullName = name,
            Email = email,
            Role = role
        });
    }

    private void SetAuthCookie(string token, DateTime expiresAt)
    {
        // secure requires https - only enforce it outside local dev so testing on http still works
        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !_env.IsDevelopment(),
            SameSite = SameSiteMode.Strict,
            Expires = expiresAt,
            Path = "/"
        });
    }

    private static UserInfoDto ToUserInfo(AuthResponseDto result)
    {
        return new UserInfoDto
        {
            UserId = result.UserId,
            FullName = result.FullName,
            Email = result.Email,
            Role = result.Role
        };
    }
}