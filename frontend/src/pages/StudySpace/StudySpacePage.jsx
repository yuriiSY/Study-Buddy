import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Flashcard from "../../components/Flashcard/Flashcard";
import WorkspaceLayout from "../../components/WorkspaceLayout/WorkspaceLayout";
import MCQTest from "../../components/MCQTest/MCQTest";
import styles from "./StudySpacePage.module.css";
import FocusHeader from "../../components/FocusHeader/FocusHeader";
import LoaderOverlay from "../../components/LoaderOverlay/LoaderOverlay";
import CustomPdfViewer from "../../components/CustomPdfViewer";
import TutorTabs from "../../components/TutorTabs/TutorTabs";
import TestsList from "../../components/TestsList/TestsList";
import TestLeaderboard from "../../components/TestLeaderboard/TestLeaderboard";

import api from "../../api/axios";
import apiPY from "../../api/axiosPython";

export const StudySpacePage = () => {
  const { moduleId } = useParams();

  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(
    localStorage.getItem("selectedFeature") || "AI Buddy"
  );
  const [showSidebar, setShowSidebar] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);

  const [selectedFile, setSelectedFile] = useState(() => {
    const saved = localStorage.getItem("selectedFile");
    return saved ? JSON.parse(saved) : null;
  });

  const prevModuleId = useRef(moduleId);

  const handleBackToTests = () => {
    setSelectedTest(null);
  };

  useEffect(() => {
    console.log(selectedFile);
    if (selectedFeature === "Flashcards" && selectedFile) {
      loadFlashcards(selectedFile.externalId);
    }
  }, [selectedFeature, selectedFile]);

  const fetchFiles = async () => {
    try {
      const res = await api.get(`/files/modules/${moduleId}/files`);
      const backendFiles = res.data.files || [];

      const formattedModules = backendFiles.map((file, index) => ({
        title: `File ${index + 1}. ${file.filename}`,
        id: file.id,
        externalId: file.externalId,
      }));

      setModules(formattedModules);

      if (formattedModules.length === 0) return;

      const savedFile = localStorage.getItem("selectedFile");
      const savedFeature = localStorage.getItem("selectedFeature");

      if (savedFile && savedFeature) {
        const parsed = JSON.parse(savedFile);

        const found = formattedModules.find((f) => f.id === parsed.id);

        if (found) {
          setSelectedFile(found);
          setSelectedFeature(savedFeature);
          return;
        }
      }

      setSelectedFeature("AI Buddy");
      setSelectedFile(formattedModules[0]);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [moduleId]);

  useEffect(() => {
    if (prevModuleId.current !== moduleId) {
      localStorage.removeItem("selectedFeature");
      localStorage.removeItem("selectedFile");

      setSelectedFeature(null);
      setSelectedFile(null);

      prevModuleId.current = moduleId;
    }
  }, [moduleId]);

  const handleFeatureSelect = (file, feature) => {
    setSelectedFeature(feature);
    setSelectedFile(file);

    localStorage.setItem("selectedFeature", feature);
    localStorage.setItem("selectedFile", JSON.stringify(file));
  };

  const handleSubmit = async (answers, score) => {
    try {
      await api.post("/test/score", {
        testId: selectedTest.id,
        score: score,
      });

      console.log("Score saved:", score);
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  const loadFlashcards = async (fileId) => {
    setLoadingFlashcards(true);
    setFlashcardsError(null);

    try {
      const res = await apiPY.post("/generate-flashcards", {
        file_ids: [fileId],
        num_flashcards: 5,
      });

      if (!res.data || !res.data.flashcards) {
        throw new Error("Invalid response format");
      }

      setFlashcards(res.data.flashcards);
    } catch (err) {
      console.error("Failed to load flashcards:", err);

      setFlashcardsError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to load flashcards."
      );
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setShowSidebar(true);
    setSelectedFeature("Flashcards");
    localStorage.setItem("selectedFeature", "Flashcards");
    
    if (selectedFile) {
      loadFlashcards(selectedFile.externalId);
    }
  };

  const handleGenerateQuiz = () => {
    setShowSidebar(true);
    setSelectedFeature("Quiz");
    localStorage.setItem("selectedFeature", "Quiz");
  };

  const handleSelectTest = async (testId) => {
    try {
      const res = await api.get(`/test/${testId}`);
      setSelectedTest(res.data);
    } catch (err) {
      console.error("Failed to load test:", err);
    }
  };

  const isMobile = window.innerWidth <= 768;

  const renderContent = () => {
    switch (selectedFeature) {
      case "Flashcards":
        if (loadingFlashcards) return <LoaderOverlay />;

        if (flashcardsError) {
          return (
            <div style={{ padding: 20 }}>
              <h2 style={{ color: "red" }}>Failed to load flashcards</h2>
              <button
                onClick={() => loadFlashcards(selectedFile?.externalId)}
                style={{
                  padding: "10px 20px",
                  background: "#4a6eff",
                  color: "white",
                  borderRadius: "6px",
                  marginTop: "10px",
                }}
              >
                Retry
              </button>
            </div>
          );
        }

        if (!flashcards.length) {
          return <p style={{ padding: 20 }}>No flashcards available.</p>;
        }

        return <Flashcard cards={flashcards} />;

      case "Quiz":
        if (selectedTest) {
          return (
            <div>
              <button
                onClick={handleBackToTests}
                style={{
                  padding: "8px 14px",
                  marginBottom: "10px",
                  background: "#eee",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                ← Back to Test List
              </button>

              <MCQTest
                questions={selectedTest.questions}
                onSubmit={handleSubmit}
              />
              <TestLeaderboard testId={selectedTest.id} moduleId={moduleId} />
            </div>
          );
        }
        return (
          <TestsList
            fileId={selectedFile?.externalId}
            onSelectTest={handleSelectTest}
          />
        );

      case "AI Buddy":
        return (
          <div className={styles.aiBuddyContainer}>
            <TutorTabs
              externalId={selectedFile?.externalId}
              fileid={selectedFile?.id}
              onGenerateFlashcards={handleGenerateFlashcards}
              onGenerateQuiz={handleGenerateQuiz}
            />
          </div>
        );

      default:
        return (
          <div className={styles.studySpaceContainer}>
            <CustomPdfViewer
              fileId={selectedFile?.id}
              fileName={`${selectedFile?.title}`}
              height="80vh"
            />
          </div>
        );
    }
  };

  if (loading) return <LoaderOverlay />;

  const shouldShowSidebar = showSidebar || selectedFeature !== "AI Buddy";

  return (
    <WorkspaceLayout
      modules={modules}
      onFeatureSelect={handleFeatureSelect}
      selectedModuleId={moduleId}
      onFilesAdded={fetchFiles}
      hasSidebar={shouldShowSidebar}
      hideSearch={true}
    >
      <div className={styles.contentWrapper}>
        {selectedFeature === "AI Buddy" && (
          <div className={styles.fileSelector}>
            <select 
              value={selectedFile?.id || ""} 
              onChange={(e) => {
                const file = modules.find(m => m.id === e.target.value);
                if (file) handleFeatureSelect(file, "AI Buddy");
              }}
              className={styles.fileDropdown}
            >
              {modules.map(file => (
                <option key={file.id} value={file.id}>
                  {file.title}
                </option>
              ))}
            </select>
          </div>
        )}
        {renderContent()}
      </div>
    </WorkspaceLayout>
  );
};
