import api from "./axios";

export const getUserFiles = async () => {
  const res = await api.get("/files");
  return res.data.files;
};

export const getFileHtml = async (moduleId, fileId) => {
  const res = await api.get(`/files/modules/${moduleId}/files/${fileId}`);
  return res.data.html;
};
