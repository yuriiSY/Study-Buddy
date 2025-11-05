import React, { useState, useEffect } from "react";
import styles from "./ModuleModal.module.css";
import api from "../../api/axios";

const ModuleModal = ({
  isOpen,
  onClose,
  onCreate,
  moduleId,
  mode = "create",
}) => {
  const [moduleName, setModuleName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "upload") {
      setModuleName("");
    }
  }, [mode]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleSubmit = async () => {
    if (mode === "create" && !moduleName.trim()) {
      alert("Please enter a module name.");
      return;
    }

    if (uploadedFiles.length === 0) {
      alert("Please upload at least one file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      if (mode === "create") {
        formData.append("moduleName", moduleName);
      } else {
        formData.append("moduleId", moduleId);
      }

      uploadedFiles.forEach((file) => formData.append("files", file));

      const res = await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload successful:", res.data);

      if (onCreate && res.data?.module) {
        onCreate(res.data.module);
      }

      setModuleName("");
      setUploadedFiles([]);
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.title}>
          {mode === "create"
            ? "Create New Study Module"
            : "Add Files to Module"}
        </h2>
        <p className={styles.subtitle}>
          {mode === "create"
            ? "Upload your study materials to create a new module."
            : "Select and upload additional files for this module."}
        </p>

        {mode === "create" && (
          <div className={styles.formGroup}>
            <label htmlFor="moduleName">Module Name</label>
            <input
              id="moduleName"
              type="text"
              className={styles.input}
              placeholder="e.g., Calculus I - Chapter 3"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        <div className={styles.uploadSection}>
          <input
            id="fileInput"
            type="file"
            multiple
            className={styles.hiddenFileInput}
            onChange={handleFileUpload}
            disabled={loading}
          />
          <label htmlFor="fileInput" className={styles.uploadButton}>
            📤 Upload Files
          </label>

          {uploadedFiles.length > 0 && (
            <ul className={styles.uploadList}>
              {uploadedFiles.map((file, i) => (
                <li key={i} className={styles.uploadedFile}>
                  <span className={styles.fileIcon}>📄</span> {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.footer}>
          <span>Total files: {uploadedFiles.length}</span>
          <div className={styles.actions}>
            <button
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className={styles.createButton}
              onClick={handleSubmit}
              disabled={uploadedFiles.length === 0 || loading}
            >
              {loading
                ? "Uploading..."
                : mode === "create"
                ? "Create Module"
                : "Add Files"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
