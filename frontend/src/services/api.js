import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5223/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send the httpOnly auth cookie automatically
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");
    if (error.response && error.response.status === 401 && !isAuthEndpoint) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;