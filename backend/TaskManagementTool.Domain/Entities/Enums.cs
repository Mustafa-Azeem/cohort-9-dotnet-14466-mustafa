namespace TaskManagementTool.Domain.Entities;

public enum TaskPriority
{
    Low = 0,
    Medium = 1,
    High = 2,
    Urgent = 3
}

// calling it JobStatus instead of TaskStatus - avoids clash 
public enum JobStatus
{
    Pending = 0,
    InProgress = 1,
    Completed = 2
}