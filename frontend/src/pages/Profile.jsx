import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import { changePassword } from "../services/authService";
import { getErrorMessage } from "../utils/errorHelper";

function Profile() {
  const { user, loading } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const initial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || "?";
  const profileName = user?.fullName?.trim() || "Name unavailable";
  const profileRole = user?.role?.trim() || "Role unavailable";
  const profileEmail = user?.email?.trim() || "Email unavailable";
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";
  const status = user?.status || "Status unavailable";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("All password fields are required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setSuccess("Password changed successfully.");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
    } catch (err) {
      setError(getErrorMessage(err, "Could not change password."));
    } finally {
      setSubmitting(false);
    }
  };

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

            {error && <div className="error-box" role="alert">{error}</div>}
            {success && <div className="success-box" role="status">{success}</div>}

            <div className="profile-actions">
              <button type="button" className="btn-change-password" onClick={() => setShowChangePassword((prev) => !prev)}>
                Change Password
              </button>
            </div>

            {showChangePassword && (
              <form className="task-form" onSubmit={handlePasswordSubmit}>
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                />

                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                />

                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />

                <div className="profile-actions">
                  <button type="submit" className="btn-change-password" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Password"}
                  </button>
                  <button type="button" className="btn-edit-profile" onClick={() => setShowChangePassword(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;