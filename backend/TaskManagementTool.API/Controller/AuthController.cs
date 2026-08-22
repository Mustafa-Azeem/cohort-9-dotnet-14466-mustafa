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
        Response.Cookies.Delete("access_token", new CookieOptions { Path = "/" });
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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var token = await _authService.ForgotPasswordAsync(request);

        // no email provider wired up yet - in dev, hand the token back directly so the
        // reset flow can be tested end to end. never do this in production.
        if (_env.IsDevelopment() && token != null)
        {
            return Ok(new { message = "Reset token generated (dev mode only).", token });
        }

        // always the same response whether or not the email exists - avoids leaking account info
        return Ok(new { message = "If that email is registered, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        await _authService.ResetPasswordAsync(request);
        return Ok(new { message = "Password has been reset. You can now log in." });
    }

    private void SetAuthCookie(string token, DateTime expiresAt)
    {
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
