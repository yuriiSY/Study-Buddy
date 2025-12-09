import React, { useState, useEffect, useRef } from "react";
import Chat from "../Chat/Chat";
import Flashcard from "../Flashcard/Flashcard";
import FlashcardsList from "../FlashcardsList/FlashcardsList";
import TestsList from "../TestsList/TestsList";
import MCQTest from "../MCQTest/MCQTest";
import TestLeaderboard from "../TestLeaderboard/TestLeaderboard";
import PomodoroTimer from "../PomodoroTimer/PomodoroTimer";
import NotesEditor from "../NotesEditor/NotesEditor";
import NotesDisplay from "../NotesDisplay/NotesDisplay";
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
  pdfFile,
  notes,
  setNotes,
}) => {
  const { moduleId } = useParams();
  const [activeTab, setActiveTab] = useState("chat");
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardLevel, setFlashcardLevel] = useState(null);
  const [flashcardLevelDescription, setFlashcardLevelDescription] = useState("");
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);
  const [showFlashcardsTab, setShowFlashcardsTab] = useState(false);
  const [showQuizTab, setShowQuizTab] = useState(false);
  const [testsExist, setTestsExist] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [viewingFlashcardsList, setViewingFlashcardsList] = useState(true);
  const notesPanelRef = useRef(null);

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

  useEffect(() => {
    if (!externalId) return;

    const loadTests = async () => {
      try {
        const res = await api.get(`/test/file/${externalId}`);
        const tests = res.data || [];
        setTestsExist(tests.length > 0);
        setShowQuizTab(tests.length > 0);
      } catch (err) {
        console.error("Failed to load tests:", err);
        setTestsExist(false);
      }
    };

    loadTests();
    setShowFlashcardsTab(true);
  }, [externalId]);

  const handleSaveNotes = async () => {
    console.log("Saving notes for fileId:", fileid, "notes:", notes);
    setIsSaving(true);
    try {
      await api.post("/notes", {
        userId,
        fileId: fileid,
        content: notes,
      });

      setEditing(false);
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async (text) => {
    try {
      const formattedText = `\n\n**AI Response:**\n${text}`;
      const res = await api.post("/notes/append", {
        userId,
        fileId: fileid,
        text: formattedText,
      });

      setNotes(res.data.content);
    } catch (err) {
      console.error("Failed to append note", err);
    }
  };

  const handleSelectFlashcardLevel = (level, cards) => {
    const levelDescriptions = {
      1: "Easy Level - Foundational concepts and definitions",
      2: "Intermediate Level - Practical applications and critical thinking",
      3: "Advanced Level - Complex analysis and synthesis"
    };

    setFlashcardLevel(level);
    setFlashcardLevelDescription(levelDescriptions[level]);
    setFlashcards(cards);
    setViewingFlashcardsList(false);
    setActiveTab("flashcards");
  };

  const handleFinishFlashcards = async () => {
    if (flashcardLevel >= 1 && flashcardLevel <= 3) {
      try {
        await apiPY.post("/recap-cards-complete-level", {
          file_id: externalId,
          level: flashcardLevel,
        });
      } catch (err) {
        console.error("Failed to mark level as completed:", err);
      }
    }
    setViewingFlashcardsList(true);
  };

  const handleNextFlashcardLevel = async () => {
    if (flashcardLevel >= 1 && flashcardLevel <= 3) {
      try {
        await apiPY.post("/recap-cards-complete-level", {
          file_id: externalId,
          level: flashcardLevel,
        });
      } catch (err) {
        console.error("Failed to mark level as completed:", err);
      }
    }
    
    const nextLevel = flashcardLevel + 1;
    if (nextLevel <= 3) {
      const levelDescriptions = {
        1: "Easy Level - Foundational concepts and definitions",
        2: "Intermediate Level - Practical applications and critical thinking",
        3: "Advanced Level - Complex analysis and synthesis"
      };

      try {
        const existingRes = await api.get(`/flashcards/file/${externalId}`);
        const existingSets = Array.isArray(existingRes.data) ? existingRes.data : [];
        const existingSet = existingSets.find(set => set.title === `Recap Cards Level ${nextLevel}`);
        
        if (existingSet && Array.isArray(existingSet.cards) && existingSet.cards.length > 0) {
          handleSelectFlashcardLevel(nextLevel, existingSet.cards);
          return;
        }
      } catch (err) {
        console.log("Checking existing flashcards - will generate new ones");
      }

      try {
        const res = await apiPY.post("/generate-flashcards", {
          file_ids: [externalId],
          num_flashcards: 5,
          level: nextLevel,
        });

        if (res.data?.flashcards) {
          const cards = res.data.flashcards;
          
          try {
            await api.post("/flashcards", {
              file_id: externalId,
              title: `Recap Cards Level ${nextLevel}`,
              description: levelDescriptions[nextLevel],
              cards: cards,
              level: nextLevel,
            });
          } catch (saveErr) {
            console.error("Failed to save flashcards:", saveErr);
          }
          
          handleSelectFlashcardLevel(nextLevel, cards);
        }
      } catch (err) {
        console.error("Failed to load next level flashcards:", err);
      }
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
            className={`${styles.tab} ${
              activeTab === "chat" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("chat")}
          >
            AI Chat
          </button>

          <button
            className={`${styles.tab} ${
              activeTab === "notes" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("notes")}
          >
            Notes
          </button>

          {showFlashcardsTab && (
            <button
              className={`${styles.tab} ${
                activeTab === "flashcards" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("flashcards")}
            >
              Recap Cards
              {loadingFlashcards && (
                <span className={styles.loadingIndicator}>...</span>
              )}
            </button>
          )}

          {showQuizTab && (
            <button
              className={`${styles.tab} ${
                activeTab === "quiz" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("quiz")}
            >
              Quiz
            </button>
          )}

          {windowWidth <= 1024 && (
            <button
              className={`${styles.tab} ${
                activeTab === "pdf" ? styles.active : ""
              }`}
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
            onGenerateFlashcards={() => {
              setViewingFlashcardsList(true);
              setActiveTab("flashcards");
            }}
            onGenerateQuiz={handleGenerateQuiz}
            testsExist={testsExist}
            flashcardsExist={true}
          />
        )}

        {activeTab === "notes" && (
          <div className={styles.notesPanel} ref={notesPanelRef}>
            {!editing ? (
              <>
                {notes ? (
                  <>
                    <NotesDisplay content={notes} />
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
              <NotesEditor
                notes={notes}
                setNotes={setNotes}
                onSave={handleSaveNotes}
                isSaving={isSaving}
              />
            )}
          </div>
        )}

        {activeTab === "flashcards" && (
          <div className={styles.flashcardsPanel}>
            {viewingFlashcardsList ? (
              <FlashcardsList
                fileId={externalId}
                onSelectLevel={handleSelectFlashcardLevel}
              />
            ) : flashcards.length > 0 ? (
              <Flashcard
                cards={flashcards}
                level={flashcardLevel}
                levelDescription={flashcardLevelDescription}
                onNextLevel={handleNextFlashcardLevel}
                onFinish={handleFinishFlashcards}
              />
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
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(59, 130, 246, 0.3)";
                    e.target.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(59, 130, 246, 0.2)";
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
              <TestsList fileId={externalId} onSelectTest={handleSelectTest} />
            )}
          </div>
        )}

        {activeTab === "pdf" && pdfFile && (
          <div className={styles.pdfPanel}>{pdfFile}</div>
        )}
      </div>
    </div>
  );
};

export default TutorTabs;
