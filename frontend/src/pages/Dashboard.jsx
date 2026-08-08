import { useEffect, useState } from "react";
import { getDashboardCounts } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const [counts, setCounts] = useState({ pending: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const data = await getDashboardCounts();
      setCounts(data);
    } catch (err) {
      console.error("Couldn't load dashboard counts", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>Dashboard</h1>
        <p className="page-subtitle">
          {isAdmin ? "Overview of all tasks in the system" : `Welcome back, ${user?.fullName}`}
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card pending">
              <div className="stat-icon">⏱</div>
              <h3>Pending</h3>
              <p className="stat-number">{counts.pending}</p>
            </div>
            <div className="stat-card in-progress">
              <div className="stat-icon">▤</div>
              <h3>In Progress</h3>
              <p className="stat-number">{counts.inProgress}</p>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">✓</div>
              <h3>Completed</h3>
              <p className="stat-number">{counts.completed}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;