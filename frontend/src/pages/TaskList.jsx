import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks, deleteTask } from "../services/taskService";
import Navbar from "../components/Navbar";

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const loadTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTasks({ status: statusFilter, priority: priorityFilter, search });
      setTasks(data);
    } catch (err) {
      setError("Couldn't load tasks. Please try again.");
    } finally {
      setLoading(false);
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
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
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
          <div className="error-box">{error}</div>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-row">
                <Link to={`/tasks/${task.id}`} className="task-row-title">
                  {task.title}
                </Link>
                <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                <span className={`badge status-${task.status.toLowerCase()}`}>{task.status}</span>
                <span className="task-assigned">{task.assignedUserName}</span>
                <button className="btn-danger-small" onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskList;