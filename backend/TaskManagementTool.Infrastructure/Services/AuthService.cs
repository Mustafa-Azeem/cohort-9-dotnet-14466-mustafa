using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TaskManagementTool.Application.DTOs.Auth;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Application.Interfaces;
using TaskManagementTool.Domain.Entities;

namespace TaskManagementTool.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration config,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _config = config;
        _logger = logger;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("Register attempt with an email that's already in use");
            throw new ApiException("Email already in use", 409);
        }

        var newUser = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName
        };

        var result = await _userManager.CreateAsync(newUser, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ApiException(errors, 400);
        }

        if (!await _roleManager.RoleExistsAsync("User"))
            await _roleManager.CreateAsync(new IdentityRole("User"));

        var roleResult = await _userManager.AddToRoleAsync(newUser, "User");
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(newUser);
            _logger.LogError("Failed to assign role to new user, rolled back account creation");
            throw new ApiException("Registration failed, please try again", 500);
        }

        _logger.LogInformation("New user registered");

        return await BuildAuthResponse(newUser, "User");
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed - no matching account for the given email");
            throw new ApiException("Invalid email or password", 401);
        }

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
        {
            _logger.LogWarning("Login failed - wrong password for user {UserId}", user.Id);
            throw new ApiException("Invalid email or password", 401);
        }

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        _logger.LogInformation("User {UserId} logged in", user.Id);

        return await BuildAuthResponse(user, role);
    }

    public async Task<string?> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        // don't reveal whether the email exists - always behave the same either way
        if (user == null)
        {
            _logger.LogInformation("Password reset requested for an email with no matching account");
            return null;
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);

        // no email provider hooked up yet - log it server-side so it can be tested locally.
        // in production this token would be emailed to the user, never returned to the client
        _logger.LogInformation("Password reset token generated for user {UserId}", user.Id);

        return token;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            throw new ApiException("Invalid or expired reset request", 400);
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new ApiException(errors, 400);
        }

        _logger.LogInformation("Password reset completed for user {UserId}", user.Id);
    }

    private Task<AuthResponseDto> BuildAuthResponse(ApplicationUser user, string role)
    {
        var jwtKey = _config["Jwt:Key"];
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
            throw new ApiException("Server auth configuration is invalid", 500);

        var expiryMinutes = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "60");
        var expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        var response = new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            Role = role,
            ExpiresAt = expiresAt
        };

        return Task.FromResult(response);
    }
}
