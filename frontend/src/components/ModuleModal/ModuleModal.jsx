import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ModuleModal.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";
import { AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import LoadingAnimation from "./LoadingAnimation";

const imageOptions = Array.from({ length: 10 }, (_, i) => `c${i + 1}.jpg`);
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
  const [fileNames, setFileNames] = useState([]); // editable display names
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("uploading");
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);

  const isCreate = mode === "create";
  const [step, setStep] = useState(isCreate ? 1 : 2);

  useEffect(() => {
    if (mode === "upload") {
      setModuleName("");
    }
  }, [mode]);

  // reset step when modal opens / mode changes
  useEffect(() => {
    if (isOpen) {
      setStep(mode === "create" ? 1 : 2);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.toLowerCase().split(".").pop();
  };

  const isFileSupported = (filename) => {
    const extension = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
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
        `Unsupported file format(s): ${rejected.join(
          ", "
        )}. Please use supported formats.`,
        { autoClose: 5000 }
      );
    }

    if (supported.length > 0) {
      setUploadedFiles((prev) => [...prev, ...supported]);
      setFileNames((prev) => [...prev, ...supported.map((f) => f.name)]);
    }

    // allow selecting same file again
    e.target.value = "";
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRenameFile = (index, newName) => {
    setFileNames((prev) => prev.map((name, i) => (i === index ? newName : name)));
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
      const pyFormData = new FormData();
      if (mode === "upload") {
        pyFormData.append("moduleId", moduleId);
      }
      uploadedFiles.forEach((file) => pyFormData.append("files", file));

      const respy = await apiPY.post("/upload-files", pyFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Python upload successful:", respy.data);
      setLoadingStage("processing");

      if (respy.data.errors && respy.data.errors.length > 0) {
        console.error("Python upload errors:", respy.data.errors);
        const errorFiles = respy.data.errors.map((e) => e.file_name).join(", ");
        toast.error(`❌ Some files failed to process: ${errorFiles}`);
      }

      if (!respy.data.uploaded || respy.data.uploaded.length === 0) {
        toast.error("❌ No files were successfully processed.");
        setLoading(false);
        return;
      }

      // ---------- 2️⃣ SEND METADATA TO NODE.JS (Database) ----------
      setLoadingStage("creating");
      let createdModule = null;

      for (let i = 0; i < respy.data.uploaded.length; i++) {
        const uploadedInfo = respy.data.uploaded[i];

        const nodePayload = {
          // For CREATE mode: only first file creates the module
          ...(mode === "create" && i === 0 && { moduleName }),
          // For CREATE mode: subsequent files use the created module ID
          ...(mode === "create" &&
            i > 0 &&
            createdModule && { moduleId: createdModule.id }),
          // For UPLOAD mode: always use the provided moduleId
          ...(mode === "upload" && { moduleId: Number(moduleId) }),

          // File metadata from Python
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

        const nodeRes = await api.post("/files/upload", nodePayload);

        if (mode === "create" && i === 0) {
          createdModule = nodeRes.data.module;
        }
      }

      if (mode === "create" && onCreate && createdModule) {
        onCreate(createdModule);
      }

      if (mode === "upload" && onUploadSuccess) {
        onUploadSuccess();
      }

      // reset + close
      setModuleName("");
      setUploadedFiles([]);
      setFileNames([]);
      setSelectedImage(null);
      setRejectedFiles([]);
      setLoadingStage("uploading");
      onClose();

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

  const handlePrimaryClick = () => {
    // step 1 -> step 2
    if (mode === "create" && step === 1) {
      if (!moduleName.trim()) {
        toast.warning("⚠️ Please enter a module name.");
        return;
      }
      setStep(2);
      return;
    }

    // step 2 / upload mode -> actual submit
    handleSubmit();
  };

  const handleCancel = () => {
    setStep(mode === "create" ? 1 : 2);
    setModuleName("");
    setUploadedFiles([]);
    setFileNames([]);
    setSelectedImage(null);
    setRejectedFiles([]);
    onClose();
  };

  if (loading) {
    return <LoadingAnimation stage={loadingStage} />;
  }

  const primaryLabel = loading
    ? "Uploading..."
    : mode === "upload"
    ? "Add Files"
    : step === 1
    ? "Next: Upload Files"
    : "Create Module";

  const shouldDisablePrimary =
    loading ||
    ((mode === "upload" || (mode === "create" && step === 2)) &&
      uploadedFiles.length === 0);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={handleCancel}>
          ✕
        </button>

        {mode === "create" && (
          <div className={styles.stepper}>
            <div
              className={`${styles.step} ${
                step >= 1 ? styles.stepActive : ""
              }`}
            >
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepLabel}>Details</div>
            </div>
            <div className={styles.stepLine} />
            <div
              className={`${styles.step} ${
                step >= 2 ? styles.stepActive : ""
              }`}
            >
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepLabel}>Upload Files</div>
            </div>
          </div>
        )}

        <h2 className={styles.title}>
          {mode === "create" ? "Create New Study Module" : "Add Files to Module"}
        </h2>
        <p className={styles.subtitle}>
          {mode === "create"
            ? step === 1
              ? "Set a name and cover image for your new study module."
              : "Upload the study materials for this module."
            : "Select and upload additional files for this module."}
        </p>

        {/* STEP 1 – name + cover */}
        {mode === "create" && step === 1 && (
          <>
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

            <div className={styles.imagePickerSection}>
              <label>Choose a Cover Image</label>
              <div className={styles.imageGrid}>
                {imageOptions.map((img, idx) => (
                  <button
                    type="button"
                    key={img || idx}
                    onClick={() => setSelectedImage(img)}
                    className={`${styles.imageChoice} ${
                      selectedImage === img ? styles.imageChoiceSelected : ""
                    }`}
                  >
                    {img && (
                      <img
                        src={img}
                        alt={`cover-${idx + 1}`}
                        className={styles.imageChoiceImg}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STEP 2 / UPLOAD MODE – drag & drop + list */}
        {(mode === "upload" || step === 2) && (
          <div className={styles.uploadWizardSection}>
            {/* hidden input used by drop area */}
            <input
              id="module-upload-input"
              type="file"
              multiple
              className={styles.hiddenFileInput}
              onChange={handleFileUpload}
              disabled={loading}
              accept={SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            />

            <div className={styles.uploadTwoColumn}>
              {/* LEFT: drag & drop / browse */}
              <label
                htmlFor="module-upload-input"
                className={styles.uploadDropCard}
              >
                <div className={styles.dropIllustration}>
                  <div className={styles.dropIconCircle}>⬆</div>
                </div>
                <h3 className={styles.dropTitle}>Drop your files here</h3>
                <p className={styles.dropSubtitle}>
                  or <span className={styles.dropBrowse}>Browse</span> to choose
                  files
                </p>
                <p className={styles.dropHint}>
                  Supported: PDF, DOCX, PPTX, images &amp; more. Max 50MB each.
                </p>
              </label>

              {/* RIGHT: editable file list */}
              <div className={styles.uploadListCard}>
                <div className={styles.listHeader}>
                  <span className={styles.listTitle}>Uploaded files</span>
                  <span className={styles.listCount}>
                    {uploadedFiles.length} selected
                  </span>
                </div>

                {uploadedFiles.length === 0 ? (
                  <p className={styles.listEmpty}>
                    No files yet. Add some on the left.
                  </p>
                ) : (
                  <ul className={styles.fileList}>
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className={styles.fileRow}>
                        <div className={styles.fileMeta}>
                          <div className={styles.fileTypeBadge}>
                            {getFileExtension(file.name).toUpperCase()}
                          </div>
                          <div className={styles.fileTextBlock}>
                            <input
                              type="text"
                              className={styles.fileNameInput}
                              value={fileNames[index] || ""}
                              onChange={(e) =>
                                handleRenameFile(index, e.target.value)
                              }
                            />
                            <span className={styles.fileSize}>
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
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
                )}

                {rejectedFiles.length > 0 && (
                  <div className={styles.rejectedFiles}>
                    <div className={styles.rejectedHeader}>
                      <AlertCircle size={16} className={styles.alertIcon} />
                      <span>Some files were rejected:</span>
                    </div>
                    <ul className={styles.rejectedList}>
                      {rejectedFiles.map((filename, i) => (
                        <li key={i} className={styles.rejectedItem}>
                          <span className={styles.rejectedFileName}>
                            {filename}
                          </span>
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
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <span>Total files: {uploadedFiles.length}</span>
          <div className={styles.actions}>
            {mode === "create" && step === 2 && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
            )}
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.createButton}
              onClick={handlePrimaryClick}
              disabled={shouldDisablePrimary}
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
