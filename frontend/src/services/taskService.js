import api from "./api";

export const getTasks = async (filters = {}) => {
  const res = await api.get("/tasks", { params: filters });
  return res.data;
};

export const getTaskById = async (id) => {
  const res = await api.get(`/tasks/${id}`);
  return res.data;
};

export const createTask = async (taskData) => {
  const res = await api.post("/tasks", taskData);
  return res.data;
};

export const updateTask = async (id, taskData) => {
  const res = await api.put(`/tasks/${id}`, taskData);
  return res.data;
};

export const deleteTask = async (id) => {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
};

export const getDashboardCounts = async () => {
  const res = await api.get("/tasks/dashboard-counts");
  return res.data;
};
