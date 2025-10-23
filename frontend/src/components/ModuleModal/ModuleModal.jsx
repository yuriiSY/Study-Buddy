import React, { useState } from "react";
import styles from "./ModuleModal.module.css";

const existingFiles = [
  {
    name: "Organic Chemistry Notes.pdf",
    type: "PDF",
    size: "3.1 MB",
    date: "Oct 17, 2025",
  },
  {
    name: "World History Timeline.docx",
    type: "DOCX",
    size: "1.8 MB",
    date: "Oct 16, 2025",
  },
  {
    name: "Physics Formulas.pdf",
    type: "PDF",
    size: "1.2 MB",
    date: "Oct 15, 2025",
  },
  {
    name: "Biology Diagrams.png",
    type: "Image",
    size: "4.5 MB",
    date: "Oct 14, 2025",
  },
  {
    name: "Statistics Study Guide.pdf",
    type: "PDF",
    size: "2.8 MB",
    date: "Oct 13, 2025",
  },
];

const ModuleModal = ({ isOpen, onClose, onCreate }) => {
  const [tab, setTab] = useState("library");
  const [moduleName, setModuleName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const toggleFileSelection = (fileName) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((name) => name !== fileName)
        : [...prev, fileName]
    );
  };

  const handleSubmit = () => {
    if (!moduleName.trim()) {
      alert("Please enter a module name.");
      return;
    }
    const filesToInclude =
      tab === "library"
        ? existingFiles.filter((f) => selectedFiles.includes(f.name))
        : uploadedFiles;
    onCreate({ moduleName, files: filesToInclude });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.title}>Create New Study Module</h2>
        <p className={styles.subtitle}>
          Select existing files from your library or upload new materials. You
          can combine multiple files into one module.
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="moduleName">Module Name</label>
          <input
            id="moduleName"
            type="text"
            className={styles.input}
            placeholder="e.g., Calculus I - Chapter 3"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              tab === "library" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("library")}
          >
            File Library
          </button>
          <button
            className={`${styles.tabButton} ${
              tab === "upload" ? styles.activeTab : ""
            }`}
            onClick={() => setTab("upload")}
          >
            Upload New
          </button>
        </div>

        {/* Tab content */}
        {tab === "library" ? (
          <div className={styles.fileList}>
            {existingFiles.map((file, i) => (
              <label key={i} className={styles.fileItem}>
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.name)}
                  onChange={() => toggleFileSelection(file.name)}
                />
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileMeta}>
                    {file.type} • {file.size} • {file.date}
                  </span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className={styles.uploadSection}>
            <input
              type="file"
              multiple
              className={styles.fileInput}
              onChange={handleFileUpload}
            />
            {uploadedFiles.length > 0 && (
              <ul className={styles.uploadList}>
                {uploadedFiles.map((file, i) => (
                  <li key={i}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <span>
            Total files:{" "}
            {tab === "library" ? selectedFiles.length : uploadedFiles.length}
          </span>
          <div className={styles.actions}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.createButton}
              onClick={handleSubmit}
              disabled={
                tab === "library"
                  ? selectedFiles.length === 0
                  : uploadedFiles.length === 0
              }
            >
              Create Module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
