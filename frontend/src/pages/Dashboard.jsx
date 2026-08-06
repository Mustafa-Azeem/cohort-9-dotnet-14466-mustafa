import { useEffect, useState } from "react";
import { getDashboardCounts } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

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
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1>Dashboard</h1>
        <p className="page-subtitle">
          {isAdmin ? "Overview of all tasks in the system" : `Welcome back, ${user?.fullName}`}
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="stats-grid">
            <div className="stat-card pending">
              <h3>Pending</h3>
              <p className="stat-number">{counts.pending}</p>
            </div>
            <div className="stat-card in-progress">
              <h3>In Progress</h3>
              <p className="stat-number">{counts.inProgress}</p>
            </div>
            <div className="stat-card completed">
              <h3>Completed</h3>
              <p className="stat-number">{counts.completed}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
