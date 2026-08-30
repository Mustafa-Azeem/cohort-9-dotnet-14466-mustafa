using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementTool.Application.DTOs.Auth;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Application.Interfaces;
using TaskManagementTool.Domain.Entities;

namespace TaskManagementTool.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _configuration;
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthController(IAuthService authService, IWebHostEnvironment env, IConfiguration configuration, UserManager<ApplicationUser> userManager)
    {
        _authService = authService;
        _env = env;
        _configuration = configuration;
        _userManager = userManager;
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
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            throw new ApiException("Not authenticated", 401);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new ApiException("User not found", 404);

        return Ok(new UserInfoDto
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Role = User.FindFirstValue(ClaimTypes.Role) ?? "User",
            CreatedAt = user.CreatedAt,
            Status = "Active"
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var token = await _authService.ForgotPasswordAsync(request);

        // in dev, hand the token back directly so the reset flow can be tested end to end.
        if (_env.IsDevelopment() && token != null)
        {
            return Ok(new { message = "Reset token generated (dev mode only).", token });
        }

        // outside development: check if email provider is configured
        if (!_env.IsDevelopment())
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpUser = _configuration["Smtp:User"];
            var smtpPassword = _configuration["Smtp:Password"];
            var frontendResetUrl = _configuration["Smtp:FrontendResetUrl"];
            var portValue = _configuration["Smtp:Port"];
            var hasValidPort = int.TryParse(portValue, out var smtpPort) && smtpPort > 0 && smtpPort <= 65535;
            var hasValidResetUrl = !string.IsNullOrWhiteSpace(frontendResetUrl)
                && Uri.TryCreate(frontendResetUrl, UriKind.Absolute, out var frontendUri)
                && frontendUri is not null
                && frontendUri.Scheme == Uri.UriSchemeHttps;

            if (string.IsNullOrWhiteSpace(smtpHost)
                || string.IsNullOrWhiteSpace(smtpUser)
                || string.IsNullOrWhiteSpace(smtpPassword)
                || !hasValidPort
                || !hasValidResetUrl)
            {
                return StatusCode(503, new { error = "Password reset is currently unavailable. Please contact support." });
            }

            // send reset link via SMTP if provider is configured and token exists
            if (token != null)
            {
                try
                {
                    var resetUrlBase = frontendResetUrl.TrimEnd('/');
                    var resetLink = $"{resetUrlBase}{(resetUrlBase.Contains('?') ? "&" : "?")}email={Uri.EscapeDataString(request.Email)}&token={Uri.EscapeDataString(token)}";

                    using (var client = new System.Net.Mail.SmtpClient(smtpHost, smtpPort))
                    {
                        client.EnableSsl = true;
                        client.Credentials = new System.Net.NetworkCredential(smtpUser, smtpPassword);

                        using (var message = new System.Net.Mail.MailMessage(smtpUser, request.Email))
                        {
                            message.Subject = "Password Reset Request";
                            message.Body = $"Click the link below to reset your password:\n{resetLink}";
                            message.IsBodyHtml = false;
                            await client.SendMailAsync(message);
                        }
                    }
                }
                catch
                {
                    // log the error but still return generic response to avoid leaking account info
                }
            }
        }

        // always the same response whether or not the email exists - avoids leaking account info
        return Ok(new { message = "If that email is registered, a reset link has been sent." });
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        if (string.IsNullOrWhiteSpace(userId))
            throw new ApiException("Not authenticated", 401);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new ApiException("User not found", 404);

        var isCurrentPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
        if (!isCurrentPasswordValid)
            throw new ApiException("Current password is incorrect", 400);

        var changeResult = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!changeResult.Succeeded)
        {
            var errors = string.Join(", ", changeResult.Errors.Select(e => e.Description));
            throw new ApiException(errors, 400);
        }

        return Ok(new { message = "Password changed successfully." });
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
            Role = result.Role,
            CreatedAt = result.CreatedAt,
            Status = result.Status
        };
    }
}
