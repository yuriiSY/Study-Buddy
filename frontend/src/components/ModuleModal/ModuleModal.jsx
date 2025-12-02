import React, { useState, useEffect } from "react";
import styles from "./ModuleModal.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";
import { Info } from "lucide-react";
import LoadingAnimation from "./LoadingAnimation";

const imageOptions = ["card-bg1.jpg", "card-bg2.jpg", "card-bg3.jpg"];
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
  const [loadingStage, setLoadingStage] = useState("uploading");
  const [selectedImage, setSelectedImage] = useState(null);

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
    setLoadingStage("uploading");
    try {
      const pyFormData = new FormData();
      if (mode === "upload") {
        pyFormData.append("moduleId", moduleId);
      }
      uploadedFiles.forEach((file) => pyFormData.append("files", file));

      const respy = await apiPY.post("/upload-files", pyFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Python Upload successful:", respy.data);
      setLoadingStage("processing");

      // Check for Python errors
      if (respy.data.errors && respy.data.errors.length > 0) {
        console.error("Python upload errors:", respy.data.errors);
        alert(
          "Some files failed to process: " +
            respy.data.errors.map((e) => e.file_name).join(", ")
        );
      }

      if (!respy.data.uploaded || respy.data.uploaded.length === 0) {
        alert("No files were successfully processed.");
        setLoading(false);
        return;
      }

      // ---------- 2️⃣ SEND METADATA TO NODE.JS (Database) ----------
      setLoadingStage("creating");
      let createdModule = null;

      // Process each file that Python successfully handled
      for (let i = 0; i < respy.data.uploaded.length; i++) {
        const uploadedInfo = respy.data.uploaded[i];

        // Create JSON payload for Node.js - EXACTLY what your backend expects
        const nodePayload = {
          // For CREATE mode: only first file creates the module
          ...(mode === "create" && i === 0 && { moduleName }),
          // For CREATE mode: subsequent files use the created module ID
          ...(mode === "create" &&
            i > 0 &&
            createdModule && { moduleId: createdModule.id }),
          // For UPLOAD mode: always use the provided moduleId
          ...(mode === "upload" && { moduleId: Number(moduleId) }),

          // File metadata from Python - EXACTLY what your backend expects
          file_id: uploadedInfo.file_id,
          file_name: uploadedInfo.file_name,
          s3Url: uploadedInfo.s3_url,
          s3Key: uploadedInfo.s3_key,
          html: uploadedInfo.html || "",

          // Cover image (only for first file in create mode)
          ...(mode === "create" && i === 0 && { coverImage: selectedImage }),
        };

        console.log(
          `Sending to Node.js (file ${i + 1}/${respy.data.uploaded.length}):`,
          nodePayload
        );

        // Send JSON to Node.js - NOT FormData
        const res = await api.post("/files/upload", nodePayload, {
          headers: { "Content-Type": "application/json" },
        });

        console.log("Node.js response:", res.data);

        // Store the created module for subsequent files
        if (mode === "create" && i === 0 && res.data.module) {
          createdModule = res.data.module;
        }
      }

      // Call onCreate callback with the created module
      if (onCreate && createdModule) {
        onCreate(createdModule);
      }

      // Reset form and close modal
      setModuleName("");
      setUploadedFiles([]);
      setSelectedImage(null);
      setLoadingStage("uploading");
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      console.error("Error details:", err.response?.data);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
      setLoadingStage("uploading");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <LoadingAnimation stage={loadingStage} />;
  }

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
        {mode === "create" && (
          <div className={styles.imagePickerSection}>
            <label>Choose a Cover Image</label>

            <div className={styles.imageGrid}>
              {imageOptions.map((img, idx) => (
                <div
                  key={idx}
                  className={`${styles.imageItem} ${
                    selectedImage === img ? styles.selectedImage : ""
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt="cover" />
                </div>
              ))}
            </div>
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
          <div className={styles.uploadButtonContainer}>
            <label htmlFor="fileInput" className={styles.uploadButton}>
              📤 Upload Files
            </label>
            <div className={styles.infoTooltip}>
              <span className={styles.supportedText}>Supported file types</span>
              <Info size={16} />
              <div className={styles.tooltipContent}>
                <p className={styles.tooltipTitle}>Supported Formats</p>
                <div className={styles.formatsList}>
                  <div>DOCX, DOC, PPTX, PPT, XLSX, XLS</div>
                  <div>PDF</div>
                  <div>PNG, JPG, JPEG, BMP, GIF</div>
                  <div>TXT</div>
                </div>
              </div>
            </div>
          </div>

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
