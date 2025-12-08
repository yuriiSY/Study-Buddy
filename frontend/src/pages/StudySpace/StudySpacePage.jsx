import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import styles from "./StudySpacePage.module.css";
import LoaderOverlay from "../../components/LoaderOverlay/LoaderOverlay";
import CustomPdfViewer from "../../components/CustomPdfViewer";
import TutorTabs from "../../components/TutorTabs/TutorTabs";
import Header from "../../components/Header/Header";
import ModuleModal from "../../components/ModuleModal/ModuleModal";

import api from "../../api/axios";

export const StudySpacePage = () => {
  const { moduleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [pdfFlex, setPdfFlex] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [notes, setNotes] = useState("");
  const containerRef = useRef(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [allFiles, setAllFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState(() => {
    const saved = localStorage.getItem("selectedFile");
    return saved ? JSON.parse(saved) : null;
  });

  const prevModuleId = useRef(moduleId);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await api.get(`/files/modules/${moduleId}/files`);
      const backendFiles = res.data.files || [];

      const formattedModules = backendFiles.map((file, index) => ({
        title: `${file.filename}`,
        displayTitle: `${index + 1}. ${file.filename}`,
        id: file.id,
        externalId: file.externalId,
      }));

      setAllFiles(formattedModules);

      if (formattedModules.length === 0) return;

      const savedFile = localStorage.getItem("selectedFile");

      if (savedFile) {
        const parsed = JSON.parse(savedFile);
        const found = formattedModules.find((f) => f.id === parsed.id);

        if (found) {
          setSelectedFile(found);
          return;
        }
      }

      setSelectedFile(formattedModules[0]);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (prevModuleId.current !== moduleId) {
      localStorage.removeItem("selectedFile");
      setSelectedFile(null);
      prevModuleId.current = moduleId;
    }
  }, [moduleId]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    localStorage.setItem("selectedFile", JSON.stringify(file));
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    fetchFiles();
  };

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleAddNote = (text) => {
    setNotes((prev) => prev + "\n\n" + text);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newPdfWidth = e.clientX - rect.left;
      const containerWidth = rect.width;
      const newFlex = newPdfWidth / (containerWidth - newPdfWidth);

      if (newPdfWidth > 300 && containerWidth - newPdfWidth > 300) {
        setPdfFlex(newFlex);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  if (loading) return <LoaderOverlay />;

  if (!selectedFile) {
    return (
      <div className={styles.wrapper}>
        <Header hideSearch={true} />
        <div className={styles.emptyState}>
          <p>No files available in this module</p>
        </div>
      </div>
    );
  }

  const isDesktop = windowWidth > 1024;

  const pdfComponent = (
    <CustomPdfViewer
      fileId={selectedFile?.id}
      fileName={`${selectedFile?.title}`}
      height="100%"
      allFiles={allFiles}
      selectedFileId={selectedFile?.id}
      onFileSelect={handleFileSelect}
      onUploadMore={() => setUploadModalOpen(true)}
      onSelectTextAddNote={handleAddNote}
    />
  );

  return (
    <div className={styles.wrapper}>
      <Header hideSearch={true} />

      <div className={styles.studySpaceContainer} ref={containerRef}>
        {isDesktop && (
          <>
            <div className={styles.pdfPane} style={{ flex: pdfFlex }}>
              {pdfComponent}
            </div>
            <div
              className={styles.resizeHandle}
              onMouseDown={handleMouseDown}
              title="Drag to resize panels"
            />
          </>
        )}
        <div className={styles.chatPane} style={{ flex: 1 }}>
          <TutorTabs
            externalId={selectedFile?.externalId}
            fileid={selectedFile?.id}
            pdfFile={!isDesktop ? pdfComponent : null}
            notes={notes}
            setNotes={setNotes}
          />
        </div>
      </div>

      <ModuleModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onCreate={handleUploadSuccess}
        onUploadSuccess={handleUploadSuccess}
        moduleId={moduleId}
        mode="upload"
      />
    </div>
  );
};
