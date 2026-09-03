using System.ComponentModel.DataAnnotations;

namespace TaskManagementTool.Application.DTOs.Users;

public class UserDto : IValidatableObject
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "User";

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        var validRoles = new[] { "Admin", "User" };
        if (!validRoles.Contains(Role))
            yield return new ValidationResult(
                $"Role must be one of: {string.Join(", ", validRoles)}",
                new[] { nameof(Role) });
    }
}
