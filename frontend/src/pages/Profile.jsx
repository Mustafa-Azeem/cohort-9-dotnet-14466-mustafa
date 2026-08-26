import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Profile() {
  const { user } = useAuth();

  const initial = user?.fullName
    ? user.fullName.charAt(0).toUpperCase()
    : "U";

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
            {/* Sphere Avatar */}
            <div className="profile-avatar-large">{initial}</div>

            {/* Profile Information */}
            <h2 className="profile-name">{user?.fullName || "Minahil"}</h2>
            <p className="profile-role">
              {user?.role || "Senior Project Manager"}
            </p>
            <p className="profile-email">
              {user?.email || "pandaminahil@gmail.com"}
            </p>
           <span>
 
	   </span>

            {/* Account & Security Details Grid */}
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
                  <p>Joined: {user?.joinedDate || "Jan 2023"}</p>
                  <p>Status: {user?.status || "Active"}</p>
                </div>
              </div>
              {/* <div className="info-column">
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
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                  <span>Security Settings</span>
                </div>
                <div className="column-details"></div>
              </div> */}
            </div>

            {/* Actions */}
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