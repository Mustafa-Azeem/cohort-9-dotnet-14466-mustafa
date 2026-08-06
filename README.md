# Task Management Tool

A full-stack task management system built with **ASP.NET Core 10** and **React.js**. Supports role-based access (Admin / Regular User), JWT authentication, task CRUD, dashboard analytics, and production-ready concerns like logging, rate limiting, and global exception handling.

## Tech Stack

**Backend**
- ASP.NET Core 10 Web API
- Entity Framework Core (Code First)
- SQL Server
- ASP.NET Core Identity (authentication + roles)
- JWT Bearer tokens
- Serilog (structured logging)
- AspNetCoreRateLimit (rate limiting)
- FluentValidation
- xUnit + Moq (unit testing)

**Frontend**
- React (Vite)
- React Router
- Axios
- Context API for auth state

## Architecture

The backend follows a clean, layered architecture:

```
TaskManagementTool.Domain          -> Entities (User, Task, Enums, AuditLog) - no dependencies
TaskManagementTool.Application     -> DTOs, service interfaces, custom exceptions
TaskManagementTool.Infrastructure  -> DbContext, EF migrations, service implementations
TaskManagementTool.API             -> Controllers, middleware, DI wiring (Program.cs)
TaskManagementTool.Tests           -> xUnit tests for services
```

Request flow:
```
React (client) -> Controller -> Service (business logic) -> EF Core -> SQL Server
```

Every request also passes through:
- Rate limiting middleware
- Global exception handling middleware
- JWT authentication/authorization

## Key Features

- **Auth**: Register/Login with JWT. First registered user automatically becomes Admin, everyone after is a regular User.
- **Role-based permissions**:
  - Admin can view all tasks, assign tasks to any user, and delete any task.
  - Regular users can only view, create, and soft-delete their own tasks.
- **Task CRUD**: title, description, due date, priority, status, category, assigned user.
- **Soft delete**: tasks are flagged as deleted rather than removed, preserving audit history.
- **Dashboard**: task counts by status (Pending / In Progress / Completed) — scoped per user, global for Admin.
- **Filters**: search by title, filter by status/priority.

## Security & Reliability

- **Rate limiting**: 60 requests/min general, 5 requests/min on login and register (brute-force protection).
- **Global exception middleware**: known errors return clean status codes/messages, unexpected errors are logged and never leak internal details to the client.
- **Serilog**: logs meaningful events (registrations, logins, task changes) and errors to console + rolling file logs.
- **JWT**: signed tokens with configurable expiry, validated on every protected request.

## Getting Started

### Prerequisites
- .NET SDK
- Node.js
- SQL Server (local instance)

### Backend Setup

```bash
cd backend
dotnet restore
dotnet ef database update --project TaskManagementTool.Infrastructure --startup-project TaskManagementTool.API
cd TaskManagementTool.API
dotnet run
```

Update the connection string in `TaskManagementTool.API/appsettings.json` to match your local SQL Server instance before running migrations.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Update `BASE_URL` in `src/services/api.js` if your backend runs on a different port.

### Running Tests

```bash
cd backend
dotnet test
```

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/tasks` | Authenticated | List tasks (filtered by role) |
| GET | `/api/tasks/{id}` | Authenticated | Get task by id |
| POST | `/api/tasks` | Authenticated | Create task |
| PUT | `/api/tasks/{id}` | Authenticated | Update task |
| DELETE | `/api/tasks/{id}` | Authenticated | Soft-delete task |
| GET | `/api/tasks/dashboard-counts` | Authenticated | Task counts by status |
| GET | `/api/users` | Admin only | List all users (for task assignment) |

## Project Status / Trade-offs

- Role assignment currently uses a simple "first user = Admin" rule rather than an invite system — a reasonable simplification for the scope of this project.
- FluentValidation is installed and available for more complex validation scenarios beyond the current DataAnnotations checks.
- Optional features (SignalR real-time updates, export/import) were left out of the initial scope to prioritize core CRUD, security, and testing.
