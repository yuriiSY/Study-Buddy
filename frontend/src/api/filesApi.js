import api from "./axios";

export const getUserFiles = async () => {
  const res = await api.get("/files");
  return res.data.files;
};

export const getFileHtml = async (moduleId, fileId) => {
  const res = await api.get(`/files/modules/${moduleId}/files/${fileId}`);
  return res.data.html;
};

export async function getFileUrl(fileId) {
  try {
    const res = await api.get(`/files/modules/${fileId}`);
    console.log("Response from getFileUrl:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch file URL:", err);
    throw new Error("Failed to fetch file URL");
  }
}
