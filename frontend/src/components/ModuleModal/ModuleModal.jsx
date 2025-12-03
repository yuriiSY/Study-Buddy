import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ModuleModal.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";
import { Info, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import LoadingAnimation from "./LoadingAnimation";

const imageOptions = Array.from({ length: 10 }, (_, i) => `c${i + 1}.jpg`);
const SUPPORTED_EXTENSIONS = [
  "docx", "doc", "pptx", "ppt", "xlsx", "xls",
  "pdf", "png", "jpg", "jpeg", "bmp", "gif", "webp", "tiff", "txt"
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

  const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.toLowerCase().split(".").pop();
  };

  const isFileSupported = (filename) => {
    const extension = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const supported = [];
    const rejected = [];

    files.forEach((file) => {
      if (isFileSupported(file.name)) {
        supported.push(file);
      } else {
        rejected.push(file.name);
      }
    });

    if (rejected.length > 0) {
      setRejectedFiles((prev) => [...prev, ...rejected]);
      toast.error(
        `Unsupported file format(s): ${rejected.join(", ")}. Please use supported formats.`,
        { autoClose: 5000 }
      );
    }

    if (supported.length > 0) {
      setUploadedFiles((prev) => [...prev, ...supported]);
      if (rejected.length === 0) {
        toast.success(` ${supported.length} file(s) added successfully`, {
          autoClose: 2000,
        });
      }
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
        const errorFiles = respy.data.errors.map((e) => e.file_name).join(", ");
        toast.error(
          `❌ Some files failed to process: ${errorFiles}`
        );
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

      // Call onCreate callback with the created module (only for create mode)
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
      const errorMsg = err.response?.data?.error || err.message || "Upload failed";
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
            accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
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
                  <div>Documents: DOCX, DOC, PPTX, PPT, XLSX, XLS</div>
                  <div>PDF: PDF</div>
                  <div>Images: PNG, JPG, JPEG, BMP, GIF, WEBP, TIFF</div>
                  <div>Text: TXT</div>
                </div>
              </div>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <ul className={styles.uploadList}>
              {uploadedFiles.map((file, i) => (
                <li key={i} className={styles.uploadedFile}>
                  <span className={styles.fileIcon}></span>
                  <span className={styles.fileName}>{file.name}</span>
                  <button
                    type="button"
                    className={styles.removeFileBtn}
                    onClick={() => handleRemoveFile(i)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          {rejectedFiles.length > 0 && (
            <div className={styles.rejectedSection}>
              <p className={styles.rejectedTitle}>
                <AlertCircle size={14} /> Unsupported files ({rejectedFiles.length})
              </p>
              <ul className={styles.rejectedList}>
                {rejectedFiles.map((filename, i) => (
                  <li key={i} className={styles.rejectedFile}>
                    <span className={styles.rejectedIcon}></span>
                    <span className={styles.rejectedFileName}>{filename}</span>
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

export default ModuleModal;
