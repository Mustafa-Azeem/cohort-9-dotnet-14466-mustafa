# Task Management Tool

A full-stack task management system built with **ASP.NET Core (.NET 10)** and **React (Vite)**. Supports role-based access (Admin / Regular User), JWT authentication via httpOnly cookies, task management with a calendar view, an admin panel, activity auditing, and a few playful UX touches like an interactive mascot on the login screen.

Built as a .NET Fullstack assignment for **10Pearls Cohort 9**.

## Tech Stack

**Backend**
- ASP.NET Core 10 Web API
- Entity Framework Core (Code First) + SQL Server
- ASP.NET Core Identity — authentication, roles
- JWT stored in httpOnly, SameSite=Strict cookies (not localStorage)
- Serilog — structured logging
- AspNetCoreRateLimit — brute-force protection on auth endpoints
- xUnit + Moq + SQLite in-memory — unit testing

**Frontend**
- React 18 (Vite)
- React Router
- Axios (cookie-based auth, `withCredentials: true`)
- Plain CSS (no UI framework) with a hand-built sidebar layout
- `lucide-react` icons

## Key Features

### Authentication & Security
- Register / Login / Logout / session check (`/me`), all via secure httpOnly cookies.
- **Roles**: Admin and User. A single Admin account is seeded automatically at startup from configuration — public registration always creates a regular User, so nobody can grant themselves Admin.
- **Promote to Admin**: an existing Admin can promote any other user to Admin from the in-app User Management page — no database access required for day-to-day admin growth.
- **Forgot / Reset Password**: token-based reset flow using ASP.NET Identity's built-in token provider. In development, the token is returned directly in the API response so the flow can be tested without an email server; the endpoint is structured so a real SMTP provider can be dropped in later without changing the frontend contract.
- Password policy: minimum 8 characters, requires uppercase, lowercase, and a digit.
- Rate limiting: 60 requests/minute generally, 5/minute on login and register.
- Global exception middleware: expected errors return clean messages and status codes; unexpected errors are logged server-side and never leak internal details to the client.

### Task Management
- Full CRUD: create, edit, delete (soft delete), view.
- Fields: title, description, due date, priority (Low/Medium/High/Urgent), status (Pending/In Progress/Completed), category, assigned user.
- **Permissions**: Admins see and manage every task and can assign tasks to anyone; regular users only see, create, and delete their own tasks.
- Filterable, searchable task list rendered as a clean table (Task / Status / Priority / Assigned To / Edit / Delete).
- Dashboard with live task counts by status.

### Calendar
- A month-view calendar (Google Calendar-style) showing both dedicated calendar events (meetings, deadlines, conferences) and task due dates side by side, color-coded by type.
- Create, edit, and delete events directly from the calendar grid.
- Browser notification reminders: while the Calendar page is open, upcoming events/deadlines trigger a native browser notification shortly before they're due.

### Admin Tools
- **User Management**: view all registered users and their roles; promote any user to Admin with one click. An admin cannot change their own role through this screen, as a safety guard.
- **Activity Log**: every task create/update/delete is recorded with who did it and when, visible to Admins as an audit trail.

### Profile
- Displays the logged-in user's name, email, role, join date, and status.
- **Change Password** from within the app (separate from the forgot-password flow — this is for a logged-in user who knows their current password).

### The Mascot
- A small animated cat mascot sits above the login/register card.
- Its eyes follow the cursor while idle, close behind its paws while a password field is focused, and its expression changes to happy on a successful login/registration or sad on an error — a small bit of personality layered on top of the auth flow.

## Architecture

Backend follows a layered, clean-architecture structure:

```
TaskManagementTool.Domain          → Entities (User, Task, CalendarEvent, AuditLog, Enums) — no dependencies
TaskManagementTool.Application     → DTOs, service interfaces, custom exceptions
TaskManagementTool.Infrastructure  → EF Core DbContext, migrations, service implementations
TaskManagementTool.API             → Controllers, middleware, dependency injection wiring (Program.cs)
TaskManagementTool.Tests           → xUnit tests for services
```

Request flow: `React (client) → Controller → Service (business logic) → EF Core → SQL Server`, passing through rate-limiting, exception-handling, and authentication middleware on every request.

## Getting Started

### Prerequisites
- .NET SDK 10
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
Update the connection string and admin seed credentials in `TaskManagementTool.API/appsettings.Development.json` to match your local setup before running migrations. The base `appsettings.json` intentionally ships with empty secret placeholders — real values belong only in the (gitignored) Development config or environment-specific config in a real deployment.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Set `VITE_API_BASE_URL` in a `.env` file if the backend runs on a different port than the default `http://localhost:5223/api`.

### Running Tests
```bash
cd backend
dotnet test
```

## API Endpoints (Selected)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, sets auth cookie |
| POST | `/api/auth/logout` | Authenticated | Clear auth cookie |
| GET | `/api/auth/me` | Authenticated | Current session info |
| POST | `/api/auth/forgot-password` | Public | Request a password reset token |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| POST | `/api/auth/change-password` | Authenticated | Change password (logged in) |
| GET/POST/PUT/DELETE | `/api/tasks` | Authenticated | Task CRUD |
| GET | `/api/tasks/dashboard-counts` | Authenticated | Task counts by status |
| GET | `/api/users` | Admin only | List all users |
| POST | `/api/users/{id}/promote` | Admin only | Promote a user to Admin |
| GET/POST/PUT/DELETE | `/api/calendar` | Authenticated | Calendar event CRUD |
| GET | `/api/auditlogs` | Admin only | Recent task activity |

## Git Workflow

Development was organized into module-based feature branches (`feature/auth`, `feature/tasks`, `feature/dashboard`), each combining smaller backend/frontend sub-branches before being opened as a single pull request against `develop`. All three have since been reviewed (via CodeRabbit and manual review) and merged.

## Notes & Trade-offs

- Admin bootstrapping uses startup-time seeding from configuration rather than a "first user becomes Admin" shortcut, closing a self-promotion risk that would otherwise exist on public registration.
- Password reset returns the token directly to the client only in the Development environment; a real deployment would wire this to an actual email provider (SMTP config is already structured for this — see `Smtp` section in configuration).
- Calendar reminders are client-side and only fire while the Calendar page is open in a browser tab — there's no background/server-side push notification system, which was out of scope for this project.
- FluentValidation is installed but validation is currently handled via DataAnnotations and `IValidatableObject` — either works for the current scope.