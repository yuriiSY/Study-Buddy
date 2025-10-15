import api from "./axios";

export const getUserFiles = async () => {
  const res = await api.get("/files");
  return res.data.files;
};

export const getFileHtml = async (id) => {
  const res = await api.get(`/files/${id}`);
  return res.data.html;
};
