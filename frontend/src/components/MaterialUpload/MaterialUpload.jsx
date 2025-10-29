import React, { useState, useRef } from "react";
import styles from "./MaterialUpload.module.css";
import api from "../../api/axios";

export default function MaterialUpload({ onUploadSuccess }) {
  const [ocr, setOcr] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef();

  const handleSelectFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileRef.current.click();
  };

  const upload = async () => {
    if (!selectedFile) return alert("Choose a file first");

    const form = new FormData();

    setLoading(true);
    try {
      await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);
      setSelectedFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Upload failed");
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
        accept=".doc,.docx,.pdf"
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
