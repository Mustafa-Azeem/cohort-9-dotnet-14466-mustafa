import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">◆</span>
        <span>TaskFlow</span>
      </div>

      <nav className="sidebar-nav">
        <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
          Dashboard
        </Link>
        <Link to="/tasks" className={isActive("/tasks") ? "active" : ""}>
          Tasks
        </Link>
        <Link to="/calendar" className={isActive("/calendar") ? "active" : ""}>
          Calendar
        </Link>
        {isAdmin && (
          <Link to="/users" className={isActive("/users") ? "active" : ""}>
            Manage Users
          </Link>
        )}
        <Link to="/profile" className={isActive("/profile") ? "active" : ""}>
          Profile
        </Link>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user?.fullName?.charAt(0) || "U"}</div>
          <div>
            <div className="sidebar-user-name">{user?.fullName}</div>
            <div className="sidebar-user-role">{isAdmin ? "Admin" : "User"}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;