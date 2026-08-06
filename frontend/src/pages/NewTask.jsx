import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createTask, getTaskById, updateTask } from "../services/taskService";
import Navbar from "../components/Navbar";

function NewTask() {
  const { id } = useParams(); // if present, we're editing not creating
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    status: "Pending",
    category: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      loadExisting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />

          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} />

          <label>Due Date</label>
          <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />

          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <label>Category</label>
          <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Work, Personal" />

          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewTask;
