namespace TaskManagementTool.Application.DTOs.Users;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    // Role is a string here to match frontend expectations; validate on input as needed.
    public string Role { get; set; } = "User";
}
