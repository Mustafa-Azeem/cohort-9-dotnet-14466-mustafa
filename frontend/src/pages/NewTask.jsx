import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTask, getTaskById, updateTask } from "../services/taskService";
import { getAllUsers } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function NewTask() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    category: "",
    assignedUserId: "",
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
    if (isEditMode) {
      loadExisting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Couldn't load users list", err);
    }
  };

  const loadExisting = async () => {
    try {
      const task = await getTaskById(id);
      setForm({
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        priority: task.priority,
        status: task.status,
        category: task.category || "",
        assignedUserId: task.assignedUserId || "",
      });
    } catch (err) {
      setError("Couldn't load task details");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditMode) {
        await updateTask(id, form);
      } else {
        await createTask(form);
      }
      navigate("/tasks");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong saving the task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="page-content">
        <h1>{isEditMode ? "Edit Task" : "New Task"}</h1>

        <form className="task-form" onSubmit={handleSubmit}>
          {error && <div className="error-box">{error}</div>}

          <label htmlFor="task-title">Title</label>
          <input id="task-title" name="title" value={form.title} onChange={handleChange} required />

          <label htmlFor="task-description">Description</label>
          <textarea id="task-description" name="description" value={form.description} onChange={handleChange} rows={4} />

          <label htmlFor="task-dueDate">Due Date</label>
          <input id="task-dueDate" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />

          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <label htmlFor="task-status">Status</label>
          <select id="task-status" name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <label htmlFor="task-category">Category</label>
          <input id="task-category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Work, Personal" />

          {isAdmin && (
            <>
              <label htmlFor="task-assignedUser">Assigned To</label>
              <select id="task-assignedUser" name="assignedUserId" value={form.assignedUserId} onChange={handleChange}>
                <option value="">-- Select user --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTask;