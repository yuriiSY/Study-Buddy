import React, { useState } from "react";
import "./CreateModuleModal.css";

const COVER_IMAGES = [
  "/covers/cover-1.jpg",
  "/covers/cover-2.jpg",
  "/covers/cover-3.jpg",
  "/covers/cover-4.jpg",
  "/covers/cover-5.jpg",
  "/covers/cover-6.jpg",
  "/covers/cover-7.jpg",
  "/covers/cover-8.jpg",
];

export default function CreateModuleModal({
  isOpen,
  onClose,
  onCreateModule,
}) {
  const [step, setStep] = useState(1);               // 1 = Details, 2 = Upload
  const [moduleName, setModuleName] = useState("");
  const [coverIndex, setCoverIndex] = useState(0);
  const [files, setFiles] = useState([]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (!moduleName.trim()) return;                  // simple guard
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    setFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const payload = {
      moduleName: moduleName.trim(),
      coverImage: COVER_IMAGES[coverIndex],
      files,
    };

    if (onCreateModule) {
      onCreateModule(payload);
    }
  };

  return (
    <div className="sb-modal-overlay">
      <div className="sb-modal">
        {/* HEADER / STEPPER */}
        <div className="sb-modal-header">
          <div className="sb-steps">
            <div className="sb-step sb-step--active">
              <span className="sb-step-number">1</span>
              <span className="sb-step-label">Details</span>
            </div>
            <div className={`sb-step ${step === 2 ? "sb-step--active" : ""}`}>
              <span className="sb-step-number">2</span>
              <span className="sb-step-label">Upload Files</span>
            </div>
          </div>

          <button
            type="button"
            className="sb-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <h2 className="sb-modal-title">Create New Study Module</h2>
        <p className="sb-modal-subtitle">
          {step === 1
            ? "Set a name and cover image for your new study module."
            : "Upload the study materials for this module."}
        </p>

        {/* BODY */}
        <div className="sb-modal-body">
          {step === 1 ? (
            <DetailsStep
              moduleName={moduleName}
              onModuleNameChange={setModuleName}
              coverIndex={coverIndex}
              onCoverChange={setCoverIndex}
            />
          ) : (
            <UploadStep
              files={files}
              onFilesChange={handleFilesChange}
              onRemoveFile={handleRemoveFile}
            />
          )}
        </div>

        {/* FOOTER BUTTONS */}
        <div className="sb-modal-footer">
          {step === 2 && (
            <button type="button" className="sb-btn sb-btn-ghost" onClick={handleBack}>
              Back
            </button>
          )}

          <button
            type="button"
            className="sb-btn sb-btn-ghost"
            onClick={onClose}
          >
            Cancel
          </button>

          {step === 1 ? (
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={handleNext}
              disabled={!moduleName.trim()}
            >
              Next: Upload Files
            </button>
          ) : (
            <button
              type="button"
              className="sb-btn sb-btn-primary"
              onClick={handleSubmit}
              disabled={files.length === 0}
            >
              Create Module
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- STEP 1: DETAILS ---------- */

function DetailsStep({
  moduleName,
  onModuleNameChange,
  coverIndex,
  onCoverChange,
}) {
  return (
    <div className="sb-step-content">
      <div className="sb-field">
        <label className="sb-field-label">Module Name</label>
        <input
          type="text"
          className="sb-input"
          placeholder="e.g., Calculus I - Chapter 3"
          value={moduleName}
          onChange={(e) => onModuleNameChange(e.target.value)}
        />
      </div>

      <div className="sb-field">
        <label className="sb-field-label">Choose a Cover Image</label>
        <div className="sb-cover-grid">
          {COVER_IMAGES.map((src, index) => (
            <button
              key={src + index}
              type="button"
              className={`sb-cover-card ${
                index === coverIndex ? "sb-cover-card--selected" : ""
              }`}
              onClick={() => onCoverChange(index)}
            >
              <img src={src} alt={`Cover ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- STEP 2: UPLOAD FILES ---------- */

function UploadStep({ files, onFilesChange, onRemoveFile }) {
  const totalSizeKb = files.reduce((sum, f) => sum + Math.round(f.size / 1024), 0);

  return (
    <div className="sb-step-content sb-step-upload">
      <div className="sb-upload-left">
        <div className="sb-dropzone">
          <div className="sb-dropzone-icon">↑</div>
          <div className="sb-dropzone-text">
            <div>Drop your files here</div>
            <div>
              or{" "}
              <label className="sb-link">
                Browse
                <input
                  type="file"
                  multiple
                  onChange={onFilesChange}
                  className="sb-file-input"
                />
              </label>{" "}
              to choose files
            </div>
            <div className="sb-dropzone-hint">
              Supported: PDF, DOCX, PPTX, images &amp; more. Max 50MB each.
            </div>
          </div>
        </div>
      </div>

      <div className="sb-upload-right">
        <h3 className="sb-upload-title">
          Uploaded files{" "}
          {files.length > 0 && (
            <span className="sb-upload-count">{files.length} selected</span>
          )}
        </h3>

        <div className="sb-upload-list">
          {files.length === 0 ? (
            <div className="sb-upload-empty">No files selected yet.</div>
          ) : (
            files.map((file, index) => (
              <div key={file.name + index} className="sb-upload-item">
                <div className="sb-upload-badge">PDF</div>
                <div className="sb-upload-meta">
                  <input
                    className="sb-upload-name"
                    value={file.name}
                    readOnly
                  />
                  <span className="sb-upload-size">
                    {Math.round(file.size / 1024)} KB
                  </span>
                </div>
                <button
                  type="button"
                  className="sb-upload-remove"
                  onClick={() => onRemoveFile(index)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sb-upload-footer">
          <span>Total files: {files.length}</span>
          {files.length > 0 && <span>Total size: {totalSizeKb} KB</span>}
        </div>
      </div>
    </div>
  );
}
