import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getTaskById, deleteTask } from "../services/taskService";
import Sidebar from "../components/Sidebar";

function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTask = async () => {
    try {
      const data = await getTaskById(id);
      setTask(data);
    } catch (err) {
      setError(err.response?.data?.error || "Task not found");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      navigate("/tasks");
    } catch (err) {
      alert("Couldn't delete task");
    }
  };

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <p className="error-box" role="alert">{error}</p>
        </main>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <h1>{task.title}</h1>
        <div className="task-detail-card">
          <p><strong>Description:</strong> {task.description || "No description"}</p>
          <p><strong>Status:</strong> {task.status}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Category:</strong> {task.category || "-"}</p>
          <p><strong>Due Date:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</p>
          <p><strong>Assigned To:</strong> {task.assignedUserName}</p>

          <div className="task-detail-actions">
            <Link to={`/tasks/${task.id}/edit`} className="btn-primary">Edit</Link>
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TaskDetail;