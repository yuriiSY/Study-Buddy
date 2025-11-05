import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AvailableMaterials.module.css";
import MaterialList from "../MaterialList/MaterialList";
import MaterialUpload from "../MaterialUpload/MaterialUpload";
import GenerateButton from "../GenerateButton/GenerateButton";
import { getUserFiles } from "../../api/filesApi";

export default function AvailableMaterials({
  isUpload = false,
  type = "materials",
}) {
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

  // const handleGenerate = () => {
  //   if (!selectedFileId) {
  //     alert("Please select a file first!");
  //     return;
  //   }
  //   navigate(`/studyspace/${selectedFileId}`);
  // };

  const handleClick = () => {
    switch (type) {
      case "selfassesment":
        navigate(`/selfassesment/${selectedFileId}`);
        break;
      case "smartrevision":
        navigate(`/smartrevision/${selectedFileId}`);
        break;
      case "materials":
      default:
        navigate(`/studyspace/${selectedFileId}`);
        break;
    }
  };

  return (
    <div className={styles.availableMaterialsSection}>
      <div className={styles.card}>
        <h2 className={styles.heading}>Available Materials</h2>
        <MaterialList
          materials={files}
          selectedId={selectedFileId}
          onSelect={handleSelectFile}
        />
        {isUpload ? (
          <MaterialUpload onUploadSuccess={fetchFiles} />
        ) : (
          <GenerateButton onClick={handleClick} />
        )}
      </div>
    </div>
  );
}
