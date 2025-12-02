import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import styles from "./StudySpacePage.module.css";
import LoaderOverlay from "../../components/LoaderOverlay/LoaderOverlay";
import CustomPdfViewer from "../../components/CustomPdfViewer";
import TutorTabs from "../../components/TutorTabs/TutorTabs";
import Header from "../../components/Header/Header";
import { FileText } from "lucide-react";

import api from "../../api/axios";

export const StudySpacePage = () => {
  const { moduleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [pdfFlex, setPdfFlex] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const containerRef = useRef(null);

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
        title: `File ${index + 1}. ${file.filename}`,
        id: file.id,
        externalId: file.externalId,
      }));

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

  const handleMouseDown = () => {
    setIsResizing(true);
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
          />
        </div>
      </div>
    </div>
  );
};
