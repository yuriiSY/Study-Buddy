import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Flashcard from "../../components/Flashcard/Flashcard";
import WorkspaceLayout from "../../components/WorkspaceLayout/WorkspaceLayout";
import MCQTest from "../../components/MCQTest/MCQTest";
import DocxViewer from "../../components/DocViewer/DocViewer";
import Chat from "../../components/Chat/Chat";
import styles from "./StudySpacePage.module.css";
import FocusHeader from "../../components/FocusHeader/FocusHeader";
import LoaderOverlay from "../../components/LoaderOverlay/LoaderOverlay";
import CustomPdfViewer from "../../components/CustomPdfViewer";

import api from "../../api/axios";
import apiPY from "../../api/axiosPython";

const cardsData = [
  {
    id: 1,
    topic: "Integration",
    difficulty: "Hard",
    question: "State the Fundamental Theorem of Calculus",
    answer:
      "It links the concept of differentiation and integration, stating that the derivative of the integral of a function is the function itself.",
  },
  {
    id: 2,
    topic: "Limits",
    difficulty: "Medium",
    question: "What is the limit of sin(x)/x as x approaches 0?",
    answer: "The limit is 1.",
  },
];

const sampleQuestions = [
  {
    id: "q1",
    topic: "Derivatives",
    difficulty: "Medium",
    question: "What is the derivative of f(x) = x³ + 2x² - 5x + 1?",
    options: [
      "3x² + 4x - 5",
      "3x² + 2x - 5",
      "x⁴ + 2x³ - 5x² + x",
      "3x² + 4x + 5",
    ],
    correctAnswer: "3x² + 2x - 5",
  },
];

export const StudySpacePage = () => {
  const { moduleId } = useParams();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [loadingMCQ, setLoadingMCQ] = useState(false);
  const [mcqError, setMcqError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    console.log(selectedFile);
    if (selectedFeature === "Flashcards" && selectedFile) {
      loadFlashcards(selectedFile.externalId);
    }
    if (selectedFeature === "Quiz" && selectedFile) {
      loadMCQ(selectedFile.externalId);
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

      if (!selectedFile && formattedModules.length > 0) {
        setSelectedFile(formattedModules[0]);
        setSelectedFeature("Notes");
      }
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [moduleId]);

  const handleFeatureSelect = (file, feature) => {
    setSelectedFeature(feature);
    setSelectedFile(file);
    console.log(`Selected ${feature} for ${file.title}`);
  };

  const handleSubmit = (answers) => {
    console.log("Submitted answers:", answers);
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

  const loadMCQ = async (fileId) => {
    setLoadingMCQ(true);
    setMcqError(null);

    try {
      const res = await apiPY.post("/generate-mcq", {
        file_ids: [fileId],
        num_questions: 5,
      });

      if (!res.data || !res.data.mcqs) {
        throw new Error("Invalid MCQ response format");
      }

      const formatted = res.data.mcqs.map((q, index) => ({
        id: `mcq_${index}`,
        topic: q.topic || "General",
        difficulty: q.difficulty || "Medium",
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer,
      }));

      setMcqQuestions(formatted);
    } catch (err) {
      console.error("Failed to load MCQs:", err);
      setMcqError(
        err?.response?.data?.error || err.message || "Failed to load MCQs."
      );
    } finally {
      setLoadingMCQ(false);
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
        if (loadingMCQ) return <LoaderOverlay />;

        if (mcqError) {
          return (
            <div style={{ padding: 20 }}>
              <h2 style={{ color: "red" }}>Failed to load MCQs</h2>
              <button
                onClick={() => loadMCQ(selectedFile.externalId)}
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
        if (!mcqQuestions.length) {
          return <p style={{ padding: 20 }}>No quiz questions available.</p>;
        }
        return <MCQTest questions={mcqQuestions} onSubmit={handleSubmit} />;
      case "AI Buddy":
        if (isMobile) {
          return (
            <div className={styles.studySpaceContainer}>
              <CustomPdfViewer
                fileId={selectedFile?.id}
                fileName={`${selectedFile?.title}`}
                height="80vh"
              />

              {/* Floating Chat Button */}
              <button
                className={styles.openChatBtn}
                onClick={() => setChatOpen(true)}
              >
                Open Chat
              </button>

              {/* Slide-up Chat Modal */}
              {chatOpen && (
                <div className={styles.chatModal}>
                  <div className={styles.chatHeader}>
                    <span>AI Buddy</span>
                    <button onClick={() => setChatOpen(false)}>Close</button>
                  </div>

                  <Chat externalId={selectedFile?.externalId} />
                </div>
              )}
            </div>
          );
        }

        // DESKTOP VIEW
        return (
          <div className={styles.studySpaceContainer}>
            <CustomPdfViewer
              fileId={selectedFile?.id}
              fileName={`${selectedFile?.title}`}
              height="80vh"
            />
            <Chat externalId={selectedFile?.externalId} />
          </div>
        );
        return (
          <div className={styles.studySpaceContainer}>
            <CustomPdfViewer
              fileId={selectedFile?.id}
              fileName={`${selectedFile?.title}`}
              height="80vh"
            />
            <Chat externalId={selectedFile?.externalId} />
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

  return (
    <WorkspaceLayout
      modules={modules}
      onFeatureSelect={handleFeatureSelect}
      selectedModuleId={moduleId}
      onFilesAdded={fetchFiles}
      hasSidebar={true}
    >
      <FocusHeader />
      {renderContent()}
    </WorkspaceLayout>
  );
};
