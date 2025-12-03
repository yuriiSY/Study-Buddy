import React, { useState, useRef } from "react";
import styles from "./MaterialUpload.module.css";
import api from "../../api/axios";
import { toast } from "react-toastify";

const SUPPORTED_EXTENSIONS = [
  "docx", "doc", "pptx", "ppt", "xlsx", "xls",
  "pdf", "png", "jpg", "jpeg", "bmp", "gif", "webp", "tiff", "txt"
];

export default function MaterialUpload({ onUploadSuccess }) {
  const [ocr, setOcr] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.toLowerCase().split(".").pop();
  };

  const isFileSupported = (filename) => {
    const extension = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  const handleSelectFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isFileSupported(file.name)) {
        toast.error(
          `❌ Unsupported file format: ${getFileExtension(file.name)}. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`
        );
        return;
      }
      setSelectedFile(file);
      toast.success(`✅ ${file.name} selected`);
    }
  };

  const triggerFileInput = () => {
    fileRef.current.click();
  };

  const upload = async () => {
    if (!selectedFile) {
      toast.warning("Please select a file first");
      return;
    }

    const form = new FormData();

    setLoading(true);
    try {
      await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);
      setSelectedFile(null);
      toast.success("✅ File uploaded successfully");
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setLoading(false);
      console.error(err);
      const errorMsg = err.response?.data?.error || "Upload failed";
      toast.error(`❌ ${errorMsg}`);
    }
  };

  return (
    <div className={styles.uploadBox}>
      <h3 className={styles.heading}>Upload New Material</h3>

      <div className={styles.radioGroup}>
        <label>
          <input type="radio" checked={!ocr} onChange={() => setOcr(false)} />
          Regular Document
        </label>
        <label>
          <input type="radio" checked={ocr} onChange={() => setOcr(true)} /> 📝
          OCR (Handwritten)
        </label>
      </div>

      <input
        type="file"
        ref={fileRef}
        style={{ display: "none" }}
        accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
        onChange={handleSelectFile}
      />

      <div className={styles.dropArea} onClick={triggerFileInput}>
        {selectedFile ? (
          <p>Selected file: {selectedFile.name}</p>
        ) : (
          <p>Click here to select a file</p>
        )}
      </div>

      <button
        className={styles.uploadBtn}
        onClick={upload}
        disabled={!selectedFile || loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
