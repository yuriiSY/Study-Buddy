import axios from "axios";

const api = axios.create({
  // Main backend (Render)
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://study-buddy-2o9t.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
