import axios from "axios";

const apiPY = axios.create({
  baseURL: "http://localhost:3000/",
});

apiPY.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiPY;
