using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using TaskManagementTool.Application.DTOs.Auth;
using TaskManagementTool.Application.Exceptions;
using TaskManagementTool.Domain.Entities;
using TaskManagementTool.Infrastructure.Services;
using Xunit;

namespace TaskManagementTool.Tests;

public class AuthServiceTests
{
    private static Mock<UserManager<ApplicationUser>> GetMockUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
    }

    private static Mock<RoleManager<IdentityRole>> GetMockRoleManager()
    {
        var store = new Mock<IRoleStore<IdentityRole>>();
        return new Mock<RoleManager<IdentityRole>>(store.Object, null!, null!, null!, null!);
    }

    private static IConfiguration GetTestConfig()
    {
        var settings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "TestSecretKeyForUnitTestsOnly123456!" },
            { "Jwt:Issuer", "TestIssuer" },
            { "Jwt:Audience", "TestAudience" },
            { "Jwt:ExpiryMinutes", "60" }
        };

        return new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
    }

    [Fact]
    public async Task RegisterAsync_ThrowsApiException_WhenEmailAlreadyUsed()
    {
        var userManager = GetMockUserManager();
        userManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(new ApplicationUser { Email = "existing@test.com" });

        var roleManager = GetMockRoleManager();
        var service = new AuthService(userManager.Object, roleManager.Object, GetTestConfig(), NullLogger<AuthService>.Instance);

        var dto = new RegisterRequestDto { FullName = "Test", Email = "existing@test.com", Password = "pass123" };

        await Assert.ThrowsAsync<ApiException>(() => service.RegisterAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_ThrowsApiException_WhenUserNotFound()
    {
        var userManager = GetMockUserManager();
        userManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((ApplicationUser?)null);

        var roleManager = GetMockRoleManager();
        var service = new AuthService(userManager.Object, roleManager.Object, GetTestConfig(), NullLogger<AuthService>.Instance);

        var dto = new LoginRequestDto { Email = "nope@test.com", Password = "pass123" };

        await Assert.ThrowsAsync<ApiException>(() => service.LoginAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_ThrowsApiException_WhenPasswordWrong()
    {
        var user = new ApplicationUser { Id = "u1", Email = "test@test.com", FullName = "Test" };

        var userManager = GetMockUserManager();
        userManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        userManager.Setup(u => u.CheckPasswordAsync(user, It.IsAny<string>())).ReturnsAsync(false);

        var roleManager = GetMockRoleManager();
        var service = new AuthService(userManager.Object, roleManager.Object, GetTestConfig(), NullLogger<AuthService>.Instance);

        var dto = new LoginRequestDto { Email = "test@test.com", Password = "wrongpass" };

        await Assert.ThrowsAsync<ApiException>(() => service.LoginAsync(dto));
    }

    [Fact]
    public async Task LoginAsync_ReturnsToken_WhenCredentialsValid()
    {
        var user = new ApplicationUser { Id = "u1", Email = "test@test.com", FullName = "Test User" };

        var userManager = GetMockUserManager();
        userManager.Setup(u => u.FindByEmailAsync(It.IsAny<string>())).ReturnsAsync(user);
        userManager.Setup(u => u.CheckPasswordAsync(user, It.IsAny<string>())).ReturnsAsync(true);
        userManager.Setup(u => u.GetRolesAsync(user)).ReturnsAsync(new List<string> { "User" });

        var roleManager = GetMockRoleManager();
        var service = new AuthService(userManager.Object, roleManager.Object, GetTestConfig(), NullLogger<AuthService>.Instance);

        var dto = new LoginRequestDto { Email = "test@test.com", Password = "correctpass" };
        var result = await service.LoginAsync(dto);

        Assert.False(string.IsNullOrEmpty(result.Token));
        Assert.Equal("User", result.Role);
    }
}