import { useEffect, useState } from "react";
import { getAuditLogs } from "../services/auditLogService";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function AuditLog() {
  const { isAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setError("");
    try {
      const data = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      setError("Couldn't load activity log.");
    } finally {
      setLoading(false);
    }
  };

  const actionLabel = (action) => {
    if (action === "TaskCreated") return "created";
    if (action === "TaskUpdated") return "updated";
    if (action === "TaskDeleted") return "deleted";
    return action;
  };

  // Admin-only guard
  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <h1>Activity Log</h1>
          <div className="error-box" role="alert">You don't have permission to access this page.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Activity Log</h1>
        <p className="page-subtitle">Recent task actions across the system</p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="error-box" role="alert">{error}</div>
        ) : logs.length === 0 ? (
          <p>No activity yet.</p>
        ) : (
          <div className="task-list">
            {logs.map((log) => (
              <div key={log.id} className="task-row">
                <span className="task-row-title">
                  {log.userName} <span className={`badge status-${actionLabel(log.action)}`}>{actionLabel(log.action)}</span>
                </span>
                <span className="task-assigned">{log.details}</span>
                <span className="task-assigned">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AuditLog;
