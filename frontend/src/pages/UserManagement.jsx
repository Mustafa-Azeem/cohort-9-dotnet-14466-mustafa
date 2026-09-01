import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { getAllUsers, promoteToAdmin } from "../services/userService";
import { useAuth } from "../context/AuthContext";

function isValidUsers(data) {
  return Array.isArray(data);
}

export default function UserManagement() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getAllUsers();
      if (!isValidUsers(data)) throw new Error("Unexpected response shape");
      setUsers(data);
    } catch (err) {
      setError("Couldn't load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (user) => {
    if (!window.confirm(`Promote ${user.fullName} to Admin?`)) return;
    try {
      await promoteToAdmin(user.id);
      // success, refresh
      await loadUsers();
      alert(`${user.fullName} is now an Admin`);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Error promoting user";
      alert(msg);
    }
  };

  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <h1>Access denied</h1>
          <p>You must be an admin to view this page.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>User Management</h1>
        <p className="page-subtitle">Manage user roles</p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <div className="error-box" role="alert">{error}</div>
        ) : (
          <table className="simple-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role || u.Role || "User"}</td>
                  <td>
                    {((u.role || u.Role) !== "Admin") ? (
                      <button onClick={() => handlePromote(u)}>Make Admin</button>
                    ) : (
                      <span className="badge">Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
