import api from "./api";

export const registerUser = async (fullName, email, password) => {
  const res = await api.post("/auth/register", { fullName, email, password });
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
};
