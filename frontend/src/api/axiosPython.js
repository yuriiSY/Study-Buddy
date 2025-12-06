import axios from "axios";

const apiPY = axios.create({
  // Flask / Python service
  baseURL:
    import.meta.env.VITE_PYTHON_API_BASE_URL ||
    "https://studybuddyai.duckdns.org/pypi",
});

apiPY.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiPY;
