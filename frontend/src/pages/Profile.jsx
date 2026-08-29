import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Profile() {
  const { user, loading } = useAuth();

  const initial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "?";
  const profileName = user?.fullName?.trim() || "Name unavailable";
  const profileRole = user?.role?.trim() || "Role unavailable";
  const profileEmail = user?.email?.trim() || "Email unavailable";
  const joinedDate = user?.joinedDate?.trim() || "Date unavailable";
  const status = user?.status?.trim() || "Status unavailable";

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="profile-container">
            <div className="profile-card">
              <p>Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="profile-container">
            <div className="profile-card">
              <p className="error-box" role="alert">
                Profile information is unavailable. Please sign in again.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p className="profile-subtitle">
              Manage your personal information and account settings.
            </p>
          </div>

          <div className="profile-card">
            <div className="profile-avatar-large">{initial}</div>

            <h2 className="profile-name">{profileName}</h2>
            <p className="profile-role">{profileRole}</p>
            <p className="profile-email">{profileEmail}</p>

            <div className="profile-info-grid">
              <div className="info-column">
                <div className="column-header">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Account Information</span>
                </div>
                <div className="column-details">
                  <p>Joined: {joinedDate}</p>
                  <p>Status: {status}</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-edit-profile">Edit Profile</button>
              <button className="btn-change-password">Change Password</button>
            </div>

            <a href="#settings" className="manage-settings-link">
              Manage All Settings
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;