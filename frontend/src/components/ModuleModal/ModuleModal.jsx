import React, { useState, useEffect, useRef } from "react";
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

// Keep this in sync with backend MAX_UPLOAD_SIZE_MB
const MAX_UPLOAD_MB = 25;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

const ModuleModal = ({
  isOpen,
  onClose,
  onCreate,
  onUploadSuccess,
  moduleId,
  mode = "create",
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const isCreate = mode === "create";

  const [step, setStep] = useState(1);
  const [moduleName, setModuleName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [ocr, setOcr] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]); // File[]
  const [fileNames, setFileNames] = useState([]); // editable display names
  const [rejectedFiles, setRejectedFiles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("uploading");

  const [isDragging, setIsDragging] = useState(false);

  // Reset state when modal opens / mode changes
  useEffect(() => {
    if (!isOpen) return;

    if (isCreate) {
      setStep(1);
    } else {
      setStep(2); // upload-only starts on upload step
    }

    setModuleName("");
    setSelectedImage(null);
    setUploadedFiles([]);
    setFileNames([]);
    setRejectedFiles([]);
    setOcr(false);
    setLoading(false);
    setLoadingStage("uploading");
  }, [isOpen, isCreate]);

  if (!isOpen) return null;

  const getFileExtension = (filename) => {
    if (!filename) return "";
    return filename.toLowerCase().split(".").pop();
  };

  const isFileSupported = (filename) => {
    const extension = getFileExtension(filename);
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  const openFilePicker = () => {
    if (!loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Shared logic for input change and drag-drop
  const processSelectedFiles = (files) => {
    const supported = [];
    const rejected = [];
    const tooBig = [];

    files.forEach((file) => {
      const name = file.name || "unnamed";

      // 1) Type check
      if (!isFileSupported(name)) {
        rejected.push(name);
        return;
      }

      // 2) Size check
      if (file.size > MAX_UPLOAD_BYTES) {
        tooBig.push(name);
        return;
      }

      supported.push(file);
    });

    // Unsupported formats
    if (rejected.length > 0) {
      setRejectedFiles((prev) => [...prev, ...rejected]);
      toast.error(
        `Unsupported file format(s): ${rejected.join(
          ", "
        )}. Please use supported formats.`,
        { autoClose: 5000 }
      );
    }

    // Too-large files
    if (tooBig.length > 0) {
      toast.error(
        `These files are too large (>${MAX_UPLOAD_MB} MB): ${tooBig.join(
          ", "
        )}`,
        { autoClose: 5000 }
      );
    }

    // Good ones
    if (supported.length > 0) {
      setUploadedFiles((prev) => [...prev, ...supported]);

      if (rejected.length === 0 && tooBig.length === 0) {
        toast.success(`✅ ${supported.length} file(s) added successfully`, {
          autoClose: 2000,
        });
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    processSelectedFiles(files);

    // Clear the input so selecting the same file again re-triggers onChange
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (loading) return;

    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;

    processSelectedFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveRejectedFile = (index) => {
    setRejectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileNameChange = (index, newName) => {
    setFileNames((prev) => {
      const next = [...prev];
      next[index] = newName;
      return next;
    });
  };

  const handleNextStep = () => {
    if (!moduleName.trim()) {
      toast.warning("Please enter a module name.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (isCreate && !moduleName.trim()) {
      toast.warning("Please enter a module name.");
      setStep(1);
      return;
    }

    if (!uploadedFiles.length) {
      toast.warning("Please upload at least one file.");
      return;
    }

    setLoading(true);
    setLoadingStage("uploading");

    try {
      // ---------- 1️⃣ SEND FILES TO PYTHON ----------
      const pyFormData = new FormData();
      if (mode === "upload") {
        pyFormData.append("moduleId", moduleId);
      }
      uploadedFiles.forEach((file) => pyFormData.append("files", file));
      pyFormData.append("ocr", ocr);

      const respy = await apiPY.post("/upload-files", pyFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Python upload successful:", respy.data);
      setLoadingStage("processing");

      if (respy.data.errors && respy.data.errors.length > 0) {
        console.error("Python upload errors:", respy.data.errors);
        const errorFiles = respy.data.errors
          .map((e) => e.file_name)
          .join(", ");
        toast.error(`Some files failed to process: ${errorFiles}`);
      }

      if (!respy.data.uploaded || respy.data.uploaded.length === 0) {
        toast.error("No files were successfully processed.");
        setLoading(false);
        return;
      }

      // ---------- 2️⃣ SEND METADATA TO NODE.JS ----------
      setLoadingStage("creating");
      let createdModule = null;

      for (let i = 0; i < respy.data.uploaded.length; i++) {
        const uploadedInfo = respy.data.uploaded[i];

        const displayName =
          fileNames[i] && fileNames[i].trim()
            ? fileNames[i].trim()
            : uploadedInfo.file_name;

        const nodePayload = {
          ...(mode === "create" && i === 0 && { moduleName }),
          ...(mode === "create" &&
            i > 0 &&
            createdModule && { moduleId: createdModule.id }),
          ...(mode === "upload" && { moduleId: Number(moduleId) }),

          file_id: uploadedInfo.file_id,
          file_name: displayName,
          s3Url: uploadedInfo.s3_url,
          s3Key: uploadedInfo.s3_key,
          html: uploadedInfo.html || "",

          ...(mode === "create" && i === 0 && { coverImage: selectedImage }),
        };

        console.log(
          `Sending to Node.js (file ${i + 1}/${respy.data.uploaded.length}):`,
          nodePayload
        );

        const res = await api.post("/files/upload", nodePayload, {
          headers: { "Content-Type": "application/json" },
        });

        console.log("Node.js response:", res.data);

        if (mode === "create" && i === 0 && res.data.module) {
          createdModule = res.data.module;
        }
      }

      if (mode === "create" && onCreate && createdModule) {
        onCreate(createdModule);
      }

      if (mode === "upload" && onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset + close
      setModuleName("");
      setSelectedImage(null);
      setUploadedFiles([]);
      setFileNames([]);
      setRejectedFiles([]);
      setOcr(false);
      setLoadingStage("uploading");
      onClose();

      if (mode === "create" && createdModule) {
        setTimeout(() => {
          navigate(`/modules/${createdModule.id}`);
        }, 500);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      const data = err.response?.data;

      if (err.response?.status === 400 && data?.errors?.length) {
        const msg = data.errors
          .map((e) => `${e.file_name}: ${e.error}`)
          .join("; ");
        toast.error(msg);
      } else {
        const errorMsg = data?.error || err.message || "Upload failed";
        toast.error(`Upload failed: ${errorMsg}`);
      }

      setLoadingStage("uploading");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation stage={loadingStage} />;
  }

  const titleText = isCreate ? "Create New Study Module" : "Add Files to Module";

  const subtitleText = isCreate
    ? step === 1
      ? "Set a name and cover image for your new study module."
      : "Upload the study materials for this module."
    : "Select and upload additional files for this module.";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* HEADER: stepper + close */}
        <div className={styles.headerRow}>
          {isCreate && (
            <div className={styles.stepper}>
              <div
                className={`${styles.step} ${
                  step === 1 ? styles.stepActive : ""
                }`}
              >
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepLabel}>Details</span>
              </div>
              <div
                className={`${styles.step} ${
                  step === 2 ? styles.stepActive : ""
                }`}
              >
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepLabel}>Upload Files</span>
              </div>
            </div>
          )}

          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <h2 className={styles.title}>{titleText}</h2>
        <p className={styles.subtitle}>{subtitleText}</p>

        {/* STEP 1 – DETAILS */}
        {isCreate && step === 1 && (
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
                    key={idx}
                    type="button"
                    className={`${styles.imageItem} ${
                      selectedImage === img ? styles.selectedImage : ""
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={`/${img}`} alt={`Cover ${idx + 1}`} />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* STEP 2 – FILE TYPE + UPLOAD GRID */}
        {(!isCreate || step === 2) && (
          <>
            {/* File type row */}
            <div className={styles.ocrToggleSection}>
              <label className={styles.ocrLabel}>File Type</label>
              <div className={styles.ocrOptions}>
                <label className={styles.ocrOption}>
                  <input
                    type="radio"
                    checked={!ocr}
                    onChange={() => setOcr(false)}
                    disabled={loading}
                  />
                  <span>📄 Regular Document</span>
                </label>
                <label className={styles.ocrOption}>
                  <input
                    type="radio"
                    checked={ocr}
                    onChange={() => setOcr(true)}
                    disabled={loading}
                  />
                  <span>📝 Handwritten Notes (OCR)</span>
                </label>
              </div>
            </div>

            {/* Upload grid: left dropzone, right uploaded list */}
            <div className={styles.uploadGrid}>
              {/* LEFT: dropzone */}
              <div
                className={`${styles.dropzoneCard} ${
                  isDragging ? styles.dropzoneActive : ""
                }`}
                onClick={openFilePicker}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="button"
              >
                <div className={styles.dropzoneInner}>
                  <div className={styles.dropzoneIconCircle}>↑</div>
                  <div className={styles.dropzoneTextBlock}>
                    <div className={styles.dropzoneTitle}>
                      Drop your files here
                    </div>
                    <div className={styles.dropzoneSubtitle}>
                      or{" "}
                      <button
                        type="button"
                        className={styles.browseLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          openFilePicker();
                        }}
                      >
                        Browse
                      </button>{" "}
                      to choose files
                    </div>
                    <div className={styles.dropzoneHint}>
                      Supported: DOCX, DOC, PPTX, PPT, XLSX, XLS, PDF, PNG,
                      JPG, JPEG, BMP, GIF, WEBP, TIFF, TXT & more. Max{" "}
                      {MAX_UPLOAD_MB}MB each.
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  id="fileInput"
                  type="file"
                  multiple
                  className={styles.hiddenFileInput}
                  onChange={handleFileUpload}
                  disabled={loading}
                  accept={SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(
                    ","
                  )}
                />
              </div>

              {/* RIGHT: uploaded files card */}
              <div className={styles.uploadedCard}>
                <div className={styles.uploadedHeader}>
                  <span className={styles.uploadedTitle}>Uploaded files</span>
                  <span className={styles.uploadedCount}>
                    {uploadedFiles.length} selected
                  </span>
                </div>

                <div className={styles.uploadedListWrapper}>
                  {uploadedFiles.length === 0 ? (
                    <div className={styles.uploadEmpty}>
                      No files selected yet.
                    </div>
                  ) : (
                    <ul className={styles.uploadList}>
                      {uploadedFiles.map((file, i) => {
                        const ext = getFileExtension(
                          file.name || ""
                        ).toUpperCase();
                        const sizeKb = Math.round(file.size / 1024);
                        return (
                          <li key={i} className={styles.uploadedFile}>
                            <span className={styles.fileBadge}>
                              {ext || "FILE"}
                            </span>
                            <div className={styles.fileMeta}>
                              <input
                                className={styles.fileNameInput}
                                value={fileNames[i] ?? file.name}
                                onChange={(e) =>
                                  handleFileNameChange(i, e.target.value)
                                }
                                disabled={loading}
                              />
                              <span className={styles.fileSize}>
                                {sizeKb} KB
                              </span>
                            </div>
                            <button
                              type="button"
                              className={styles.removeFileBtn}
                              onClick={() => handleRemoveFile(i)}
                              title="Remove file"
                              disabled={loading}
                            >
                              ✕
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Unsupported files list under the grid */}
            {rejectedFiles.length > 0 && (
              <div className={styles.rejectedSection}>
                <p className={styles.rejectedTitle}>
                  <AlertCircle size={14} /> Unsupported files (
                  {rejectedFiles.length})
                </p>
                <ul className={styles.rejectedList}>
                  {rejectedFiles.map((filename, i) => (
                    <li key={i} className={styles.rejectedFile}>
                      <span className={styles.rejectedIcon} />
                      <span className={styles.rejectedFileName}>
                        {filename}
                      </span>
                      <button
                        type="button"
                        className={styles.removeFileBtn}
                        onClick={() => handleRemoveRejectedFile(i)}
                        title="Dismiss"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <div className={styles.footer}>
          <span className={styles.footerMeta}>
            Total files: {uploadedFiles.length}
          </span>
          <div className={styles.actions}>
            {isCreate && step === 2 && (
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
            )}

            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            {isCreate ? (
              step === 1 ? (
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={handleNextStep}
                  disabled={!moduleName.trim() || loading}
                >
                  Next: Upload Files
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={handleSubmit}
                  disabled={!uploadedFiles.length || loading}
                >
                  {loading ? "Uploading..." : "Create Module"}
                </button>
              )
            ) : (
              <button
                type="button"
                className={styles.createButton}
                onClick={handleSubmit}
                disabled={!uploadedFiles.length || loading}
              >
                {loading ? "Uploading..." : "Add Files"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
