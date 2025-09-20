import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getUsers = async () => {
  const { data } = await axios.get(`${API_URL}/users`);
  return data;
};
