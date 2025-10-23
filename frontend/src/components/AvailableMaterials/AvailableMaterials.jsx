import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AvailableMaterials.module.css";
import MaterialList from "../MaterialList/MaterialList";
import MaterialUpload from "../MaterialUpload/MaterialUpload";
import GenerateButton from "../GenerateButton/GenerateButton";
import { getUserFiles } from "../../api/filesApi";

export default function AvailableMaterials() {
  const [files, setFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await getUserFiles();
      setFiles(fetchedFiles);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch files");
    }
  };

  const handleSelectFile = (id) => {
    setSelectedFileId(id);
  };

  const handleGenerate = () => {
    if (!selectedFileId) {
      alert("Please select a file first!");
      return;
    }
    navigate(`/studyspace/${selectedFileId}`);
  };

  return (
    <div className={styles.availableMaterialsSection}>
      <div className={styles.uploadInfoSection}>
        <div className={styles.upload}></div>
        <p className={styles.infoTitle}>Upload Your Study Materials</p>
        <p className={styles.infoText}>
          Select or upload your materials to create a personalized study plan
        </p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.heading}>Available Materials</h2>
        <MaterialList
          materials={files}
          selectedId={selectedFileId}
          onSelect={handleSelectFile}
        />
        <MaterialUpload onUploadSuccess={fetchFiles} />
        <GenerateButton onClick={handleGenerate} />
      </div>
    </div>
  );
}
