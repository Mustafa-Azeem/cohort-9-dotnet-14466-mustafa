import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errorHelper";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", { email, token, newPassword });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset password</h2>
        <p className="auth-subtitle">Enter the reset token and your new password.</p>

        {error && <div className="error-box" role="alert">{error}</div>}
        {message && <div className="success-box" role="status">{message}</div>}

        <label htmlFor="reset-email">Email</label>
        <input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="reset-token">Reset Token</label>
        <input id="reset-token" type="text" value={token} onChange={(e) => setToken(e.target.value)} required />

        <label htmlFor="reset-password">New Password</label>
        <input
          id="reset-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}

export default ResetPassword;
