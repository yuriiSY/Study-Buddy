import React, { useState, useEffect } from "react";
import Chat from "../Chat/Chat";
import Flashcard from "../Flashcard/Flashcard";
import TestsList from "../TestsList/TestsList";
import MCQTest from "../MCQTest/MCQTest";
import TestLeaderboard from "../TestLeaderboard/TestLeaderboard";
import PomodoroTimer from "../PomodoroTimer/PomodoroTimer";
import styles from "./TutorTabs.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";
import { useParams } from "react-router-dom";
import LoaderOverlay from "../LoaderOverlay/LoaderOverlay";
import { FileText } from "lucide-react";

const TutorTabs = ({ 
  externalId, 
  userId, 
  fileid,
  pdfFile
}) => {
  const { moduleId } = useParams();
  const [activeTab, setActiveTab] = useState("chat");
  const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);
  const [showFlashcardsTab, setShowFlashcardsTab] = useState(false);
  const [showQuizTab, setShowQuizTab] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!externalId) return;

    const loadNotes = async () => {
      try {
        const res = await api.get("/notes", {
          params: { userId, fileId: fileid },
        });

        setNotes(res.data?.content || "");
      } catch (err) {
        console.error("Failed to load notes", err);
      }
    };

    loadNotes();
  }, [externalId, userId, fileid]);

  const handleSaveNotes = async () => {
    console.log("Saving notes for fileId:", fileid, "notes:", notes);
    try {
      await api.post("/notes", {
        userId,
        fileId: fileid,
        content: notes,
      });

      setEditing(false);
    } catch (err) {
      console.error("Failed to save notes", err);
    }
  };

  const handleAddNote = async (text) => {
    try {
      const res = await api.post("/notes/append", {
        userId,
        fileId: fileid,
        text,
      });

      setNotes(res.data.content);
      setActiveTab("notes");
    } catch (err) {
      console.error("Failed to append note", err);
    }
  };

  const loadFlashcards = async () => {
    setLoadingFlashcards(true);
    setFlashcardsError(null);

    try {
      const res = await apiPY.post("/generate-flashcards", {
        file_ids: [externalId],
        num_flashcards: 5,
      });

      if (!res.data || !res.data.flashcards) {
        throw new Error("Invalid response format");
      }

      setFlashcards(res.data.flashcards);
      setShowFlashcardsTab(true);
      setActiveTab("flashcards");
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

  const handleGenerateQuiz = () => {
    setShowQuizTab(true);
    setActiveTab("quiz");
  };

  const handleSelectTest = async (testId) => {
    try {
      const res = await api.get(`/test/${testId}`);
      setSelectedTest(res.data);
    } catch (err) {
      console.error("Failed to load test:", err);
    }
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

  const handleBackToTests = () => {
    setSelectedTest(null);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.tabs}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tab} ${activeTab === "chat" ? styles.active : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            AI Chat
          </button>

        <button
          className={`${styles.tab} ${activeTab === "notes" ? styles.active : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>

        {showFlashcardsTab && (
          <button
            className={`${styles.tab} ${activeTab === "flashcards" ? styles.active : ""}`}
            onClick={() => setActiveTab("flashcards")}
          >
            Flashcards
            {loadingFlashcards && <span className={styles.loadingIndicator}>...</span>}
          </button>
        )}

        {showQuizTab && (
          <button
            className={`${styles.tab} ${activeTab === "quiz" ? styles.active : ""}`}
            onClick={() => setActiveTab("quiz")}
          >
            Quiz
          </button>
        )}

        {windowWidth <= 1024 && (
          <button
            className={`${styles.tab} ${activeTab === "pdf" ? styles.active : ""}`}
            onClick={() => setActiveTab("pdf")}
            title="View PDF"
          >
            <FileText size={16} />
            <span>PDF</span>
          </button>
        )}
        </div>
        
        <div className={styles.timerWrapper}>
          <PomodoroTimer />
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === "chat" && (
          <Chat 
            externalId={externalId} 
            onAddNote={handleAddNote}
            onGenerateFlashcards={loadFlashcards}
            onGenerateQuiz={handleGenerateQuiz}
          />
        )}

        {activeTab === "notes" && (
          <div className={styles.notesPanel}>
            {!editing ? (
              <>
                {notes ? (
                  <>
                    <div className={styles.notesDisplay}>{notes}</div>
                    <button
                      className={styles.editBtn}
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                  </>
                ) : (
                  <div className={styles.emptyNotes}>
                    <p className={styles.emptyIcon}>📝</p>
                    <h3>No notes yet</h3>
                    <p>Add notes from the AI chat or write your own here.</p>
                    <button
                      className={styles.editBtn}
                      onClick={() => setEditing(true)}
                    >
                      Write Notes
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <textarea
                  className={styles.textArea}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write or paste your notes here..."
                />
                <button className={styles.saveBtn} onClick={handleSaveNotes}>
                  Save
                </button>
              </>
            )}
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className={styles.flashcardsPanel}>
            {loadingFlashcards ? (
              <div className={styles.generatingOverlay}>
                <div className={styles.generatingContent}>
                  <div className={styles.spinner}></div>
                  <p>Generating flashcards...</p>
                  <span className={styles.dot}>.</span>
                  <span className={styles.dot} style={{animationDelay: '0.2s'}}>.</span>
                  <span className={styles.dot} style={{animationDelay: '0.4s'}}>.</span>
                </div>
              </div>
            ) : flashcardsError ? (
              <div style={{ padding: 20 }}>
                <h2 style={{ color: "red" }}>Failed to load flashcards</h2>
                <button
                  onClick={loadFlashcards}
                  style={{
                    padding: "10px 20px",
                    background: "var(--color-primary)",
                    color: "white",
                    borderRadius: "6px",
                    marginTop: "10px",
                  }}
                >
                  Retry
                </button>
              </div>
            ) : flashcards.length > 0 ? (
              <Flashcard cards={flashcards} />
            ) : (
              <p style={{ padding: 20 }}>No flashcards available.</p>
            )}
          </div>
        )}

        {activeTab === "quiz" && (
          <div className={styles.quizPanel}>
            {selectedTest ? (
              <div>
                <button
                  onClick={handleBackToTests}
                  style={{
                    padding: "8px 14px",
                    marginBottom: "10px",
                    background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)`,
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.2)";
                    e.target.style.transform = "translateY(0)";
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
            ) : (
              <TestsList
                fileId={externalId}
                onSelectTest={handleSelectTest}
              />
            )}
          </div>
        )}

        {activeTab === "pdf" && pdfFile && (
          <div className={styles.pdfPanel}>
            {pdfFile}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorTabs;
