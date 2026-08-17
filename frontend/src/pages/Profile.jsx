import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>My Profile</h1>
        <div className="profile-card">
          <div className="profile-avatar-large">{initials}</div>
          <h2 className="profile-name">{user?.fullName}</h2>
          <p className="profile-email">{user?.email}</p>
          <span className="badge profile-role-badge">{user?.role}</span>

          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </main>
    </div>
  );
}

export default Profile;