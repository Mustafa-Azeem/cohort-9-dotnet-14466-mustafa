import api from "./api";

export const getAllUsers = async () => {
  const res = await api.get("/users");
  if (!Array.isArray(res.data)) {
    throw new Error("Unexpected response loading users");
  }
  return res.data;
};