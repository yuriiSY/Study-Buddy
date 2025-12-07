import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ModuleModal.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";
import { Info, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import LoadingAnimation from "./LoadingAnimation";

const imageOptions = Array.from({ length: 10 }, (_, i) => `c${i + 1}.jpg`);
const coverImages = imageOptions;

const SUPPORTED_EXTENSIONS = [
  "docx",
  "doc",
  "pptx",
  "ppt",
  "xlsx",
  "xls",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "bmp",
  "gif",
  "webp",
  "tiff",
  "txt",
];

const ModuleModal = ({
  isOpen,
  onClose,
  onCreate,
  onUploadSuccess,
  moduleId,
  mode = "create",
}) => {
  const navigate = useNavigate();
  const [moduleName, setModuleName] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("uploading");
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);

  useEffect(() => {
    if (mode === "upload") {
      setModuleName("");
    }
  }, [mode]);

  if (!isOpen) return null;

  const validateFile = (file) => {
    const maxSizeMB = 50;
    const fileSizeMB = file.size / (1024 * 1024);
    const extension = file.name.split(".").pop().toLowerCase();

    if (fileSizeMB > maxSizeMB) {
      return { valid: false, reason: "File too large (max 50MB)" };
    }
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        reason: `Unsupported file type (.${extension}). Allowed: ${SUPPORTED_EXTENSIONS.join(
          ", "
        )}`,
      };
    }
    return { valid: true };
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const validFiles = [];
    const rejected = [];

    files.forEach((file) => {
      const { valid, reason } = validateFile(file);

      if (valid) {
        validFiles.push(file);
      } else {
        rejected.push({ file, reason });
      }
    });

    if (rejected.length > 0) {
      setRejectedFiles((prev) => [...prev, ...rejected]);
      rejected.forEach((item) => {
        toast.warning(`⚠️ ${item.file.name}: ${item.reason}`);
      });
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveRejectedFile = (index) => {
    setRejectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (mode === "create" && !moduleName.trim()) {
      toast.warning("⚠️ Please enter a module name.");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.warning("⚠️ Please upload at least one file.");
      return;
    }

    setLoading(true);
    setLoadingStage("uploading");

    try {
      // ---------- 1️⃣ SEND FILES TO PYTHON SERVICE ----------
      const formDataPY = new FormData();
      uploadedFiles.forEach((file) => {
        formDataPY.append("files", file);
      });

      const respy = await apiPY.post("/upload", formDataPY, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!respy.data || !Array.isArray(respy.data.uploaded)) {
        toast.error(
          "❌ Unexpected response from Python service. Please try again."
        );
        setLoading(false);
        return;
      }

      if (respy.data.failed && respy.data.failed.length > 0) {
        respy.data.failed.forEach((item) => {
          toast.error(
            `❌ ${item.file_name} failed: ${item.error || "Unknown error"}`
          );
        });
      }

      if (!respy.data.uploaded || respy.data.uploaded.length === 0) {
        toast.error("❌ No files were successfully processed.");
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
          file_path: uploadedInfo.file_path,
          page_count: uploadedInfo.page_count,
          content_type: uploadedInfo.content_type,
          ...(selectedImage && { moduleCoverImage: selectedImage }),
        };

        const nodeResponse = await api.post("/files/upload", nodePayload);

        // Capture the created module from the first successful response
        if (mode === "create" && i === 0) {
          createdModule = nodeResponse.data.module;
        }
      }

      // Call onCreate callback with the created module
      if (mode === "create" && onCreate && createdModule) {
        onCreate(createdModule);
      }

      // Call onUploadSuccess callback (for upload mode)
      if (mode === "upload" && onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset form and close modal
      setModuleName("");
      setUploadedFiles([]);
      setSelectedImage(null);
      setLoadingStage("uploading");
      onClose();

      // Navigate to the newly created module if in create mode
      if (mode === "create" && createdModule) {
        setTimeout(() => {
          navigate(`/modules/${createdModule.id}`);
        }, 500);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      console.error("Error details:", err.response?.data);
      const errorMsg =
        err.response?.data?.error || err.message || "Upload failed";
      toast.error(`❌ Upload failed: ${errorMsg}`);
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
          {mode === "create" ? "Create New Study Module" : "Add Files to Module"}
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
              {coverImages.map((img, idx) => (
                <div
                  key={img || idx}
                  onClick={() => setSelectedImage(img)}
                  className={
                    selectedImage === img ? styles.imageSelected : undefined
                  }
                >
                  {img && (
                    <img src={img} alt={`cover-${idx + 1}`} loading="lazy" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.uploadSection}>
          <div className={styles.uploadHeader}>
            <div className={styles.uploadTitle}>
              <Info size={20} className={styles.infoIcon} />
              <div>
                <h3>Upload Study Materials</h3>
                <p>Supported formats: PDF, DOCX, PPTX, images & more.</p>
              </div>
            </div>
          </div>

          <label className={styles.uploadArea}>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={loading}
            />
            <p>
              <span>Click to upload</span> or drag and drop files here
            </p>
            <p className={styles.helperText}>Maximum file size: 50MB</p>
          </label>

          {uploadedFiles.length > 0 && (
            <div className={styles.fileList}>
              <h4>Files to be uploaded</h4>
              <ul>
                {uploadedFiles.map((file, index) => (
                  <li key={index} className={styles.fileItem}>
                    <FileTextIcon />
                    <span className={styles.fileName}>{file.name}</span>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => handleRemoveFile(index)}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rejectedFiles.length > 0 && (
            <div className={styles.rejectedFiles}>
              <div className={styles.rejectedHeader}>
                <AlertCircle size={18} className={styles.alertIcon} />
                <span>Some files were rejected:</span>
              </div>
              <ul>
                {rejectedFiles.map((item, i) => (
                  <li key={i} className={styles.rejectedItem}>
                    <span>{item.file.name}</span>
                    <span className={styles.reason}>{item.reason}</span>
                    <button
                      type="button"
                      className={styles.removeFileBtn}
                      onClick={() => handleRemoveRejectedFile(i)}
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
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

const FileTextIcon = () => (
  <span
    style={{
      display: "inline-flex",
      width: 18,
      height: 18,
      borderRadius: 4,
      background: "#e0f2fe",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      marginRight: 8,
    }}
  >
    <FileTextInner />
  </span>
);

const FileTextInner = () => <span style={{ fontWeight: "bold" }}>F</span>;

export default ModuleModal;
