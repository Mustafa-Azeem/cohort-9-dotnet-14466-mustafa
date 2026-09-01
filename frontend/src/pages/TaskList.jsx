import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { getTasks, deleteTask } from "../services/taskService";
import Sidebar from "../components/Sidebar";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  const latestRequestId = useRef(0);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const loadTasks = async () => {
    const requestId = ++latestRequestId.current;
    setLoading(true);
    setError("");

    try {
      const data = await getTasks({ status: statusFilter, priority: priorityFilter, search });
      if (requestId !== latestRequestId.current) return;
      if (!Array.isArray(data)) throw new Error("Unexpected response shape");
      setTasks(data);
    } catch (err) {
      if (requestId !== latestRequestId.current) return;
      setError("Couldn't load tasks. Please try again.");
    } finally {
      if (requestId === latestRequestId.current) setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadTasks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err) {
      alert("Couldn't delete task");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header-row">
          <h1>Tasks</h1>
          <Link to="/tasks/new" className="btn-primary">+ New Task</Link>
        </div>

        <form className="filters-row" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
          <button type="submit">Search</button>
        </form>

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <div className="error-box" role="alert">{error}</div>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div className="task-table-wrapper">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="task-name-cell">
                      <Link to={`/tasks/${task.id}`} className="task-name-link">
                        {task.title}
                      </Link>
                    </td>
                    <td className="status-cell">
                      <span className={`badge status-${task.status.toLowerCase()}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="priority-cell">
                      <span className={`badge priority-${task.priority.toLowerCase()}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="assigned-cell">
                      {task.assignedUserName}
                    </td>
                    <td className="actions-cell">
                      <div className="actions-flex">
                        <Link to={`/tasks/${task.id}/edit`} className="action-btn edit-btn" aria-label="Edit task">
                          <Pencil size={18} />
                        </Link>
                        <button className="action-btn delete-btn" onClick={() => handleDelete(task.id)} aria-label="Delete task">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default TaskList;