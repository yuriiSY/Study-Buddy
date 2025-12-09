import React, { useState, useEffect, useRef } from "react";
import Chat from "../Chat/Chat";
import Flashcard from "../Flashcard/Flashcard";
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
  // const [notes, setNotes] = useState("");
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardLevel, setFlashcardLevel] = useState(1);
  const [flashcardLevelDescription, setFlashcardLevelDescription] = useState("Easy - Direct recall from notes");
  const [loadingFlashcards, setLoadingFlashcards] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState(null);
  const [showFlashcardsTab, setShowFlashcardsTab] = useState(false);
  const [showQuizTab, setShowQuizTab] = useState(false);
  const [testsExist, setTestsExist] = useState(false);
  const [flashcardsExist, setFlashcardsExist] = useState(false);
  const [currentFlashcardSetId, setCurrentFlashcardSetId] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [completedLevels, setCompletedLevels] = useState([]);
  const [allLevelsCompleted, setAllLevelsCompleted] = useState(false);
  const [showLevelCompletionPage, setShowLevelCompletionPage] = useState(false);
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

    const loadStoredFlashcards = async () => {
      try {
        const res = await api.get(`/flashcards/file/${externalId}`);
        const flashcardSets = res.data || [];
        if (flashcardSets.length > 0) {
          setFlashcardsExist(true);
          setShowFlashcardsTab(true);
          setCurrentFlashcardSetId(flashcardSets[0].id);
          const cards = Array.isArray(flashcardSets[0].cards)
            ? flashcardSets[0].cards
            : [];
          setFlashcards(cards);
        }
      } catch (err) {
        console.error("Failed to load flashcards:", err);
      }
    };

    const loadCompletionStatus = () => {
      const storageKey = `flashcard_completed_${externalId}`;
      const completed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      setCompletedLevels(completed);
      setAllLevelsCompleted(completed.length === 3);
    };

    loadTests();
    loadStoredFlashcards();
    loadCompletionStatus();
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

  const loadFlashcards = async (requestedLevel = 1) => {
    setLoadingFlashcards(true);
    setFlashcardsError(null);
    setShowFlashcardsTab(true);
    setActiveTab("flashcards");
    setShowLevelCompletionPage(false);

    try {
      setFlashcardLevel(requestedLevel);
      
      const levelDescriptions = {
        1: "Easy Level - Foundational concepts and definitions",
        2: "Intermediate Level - Practical applications and critical thinking",
        3: "Advanced Level - Complex analysis and synthesis"
      };

      try {
        console.log(`Checking for existing Level ${requestedLevel} flashcards...`);
        const existingRes = await api.get(`/flashcards/file/${externalId}`);
        const existingSets = Array.isArray(existingRes.data) ? existingRes.data : [];
        const existingSet = existingSets.find(set => set.title === `Recap Cards Level ${requestedLevel}`);
        
        if (existingSet && Array.isArray(existingSet.cards) && existingSet.cards.length > 0) {
          console.log(`Found existing Level ${requestedLevel} flashcards in database (${existingSet.cards.length} cards)`);
          setFlashcards(existingSet.cards);
          setCurrentFlashcardSetId(existingSet.id);
          setFlashcardLevelDescription(levelDescriptions[requestedLevel]);
          setLoadingFlashcards(false);
          return;
        }
      } catch (err) {
        console.log("Checking existing flashcards - none found yet, will generate new ones");
      }

      console.log(`No existing Level ${requestedLevel} flashcards found. Generating new ones...`);
      const res = await apiPY.post("/generate-flashcards", {
        file_ids: [externalId],
        num_flashcards: 5,
        level: requestedLevel,
      });

      if (!res.data || !res.data.flashcards) {
        throw new Error("Invalid response format");
      }

      const newCards = res.data.flashcards.map(card => ({
        question: card.question,
        answer: card.answer,
        hint: card.hint || ""
      }));
      const level = res.data.level || requestedLevel;

      setFlashcardLevel(level);
      setFlashcardLevelDescription(levelDescriptions[level]);
      setFlashcards(newCards);

      console.log(`Saving Level ${level} flashcards to database...`);
      const saveRes = await api.post("/flashcards", {
        file_id: externalId,
        title: `Recap Cards Level ${level}`,
        description: levelDescriptions[level],
        cards: newCards,
      });
      setCurrentFlashcardSetId(saveRes.data.id);
      console.log(`Saved new flashcard set with ID: ${saveRes.data.id}`);
    } catch (err) {
      console.error("Failed to load flashcards:", err);
      setFlashcardsError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err.message ||
          "Failed to load flashcards."
      );
    } finally {
      setLoadingFlashcards(false);
    }
  };

  const handleFinishFlashcards = () => {
    if (flashcardLevel >= 1 && flashcardLevel <= 3) {
      const storageKey = `flashcard_completed_${externalId}`;
      const completed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      
      if (!completed.includes(flashcardLevel)) {
        completed.push(flashcardLevel);
        completed.sort();
        localStorage.setItem(storageKey, JSON.stringify(completed));
        console.log(`Saved Level ${flashcardLevel} completion to localStorage`);
      }
      
      setCompletedLevels(completed);
      setAllLevelsCompleted(completed.length === 3);
      setShowLevelCompletionPage(true);
    }
  };

  const handleNextFlashcardLevel = async () => {
    setShowLevelCompletionPage(false);
    if (flashcardLevel === 3) {
      await loadFlashcards(1);
    } else {
      const nextLevel = flashcardLevel + 1;
      if (nextLevel <= 3) {
        await loadFlashcards(nextLevel);
      }
    }
  };

  const handleGenerateMoreFlashcards = async () => {
    await loadFlashcards();
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
              onClick={() => {
                setActiveTab("flashcards");
                loadFlashcards(1);
              }}
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
            onGenerateFlashcards={loadFlashcards}
            onGenerateQuiz={handleGenerateQuiz}
            testsExist={testsExist}
            flashcardsExist={flashcardsExist}
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
            {loadingFlashcards ? (
              <div className={styles.generatingOverlay}>
                <div className={styles.generatingContent}>
                  <div className={styles.spinner}></div>
                  <p>Generating recap cards...</p>
                  <span className={styles.dot}>.</span>
                  <span
                    className={styles.dot}
                    style={{ animationDelay: "0.2s" }}
                  >
                    .
                  </span>
                  <span
                    className={styles.dot}
                    style={{ animationDelay: "0.4s" }}
                  >
                    .
                  </span>
                </div>
              </div>
            ) : flashcardsError ? (
              <div style={{ padding: 20 }}>
                <h2 style={{ color: "red" }}>Failed to load recap cards</h2>
                <button
                  onClick={() => loadFlashcards()}
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
            ) : allLevelsCompleted ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '3rem 2rem',
                textAlign: 'center',
                gap: '2rem'
              }}>
                <div style={{ fontSize: '4rem' }}>🏆</div>
                <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>All Levels Completed!</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0 }}>
                  You've mastered all 3 levels. You're a champion! 🎯
                </p>
                <button
                  onClick={() => {
                    setAllLevelsCompleted(false);
                    setShowLevelCompletionPage(false);
                    loadFlashcards(1);
                  }}
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  Start Again
                </button>
              </div>
            ) : showLevelCompletionPage ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '3rem 2rem',
                textAlign: 'center',
                gap: '2rem'
              }}>
                <div style={{ fontSize: '4rem' }}>🎉</div>
                <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>Level {flashcardLevel} Completed!</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {flashcardLevelDescription}
                </p>
                <button
                  onClick={handleNextFlashcardLevel}
                  style={{
                    padding: '0.9rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  {flashcardLevel === 3 ? '🏆 Finish' : '⚡ Next Level'}
                </button>
              </div>
            ) : flashcards.length > 0 ? (
              <Flashcard
                cards={flashcards}
                onGenerateMore={handleGenerateMoreFlashcards}
                isLoadingMore={loadingFlashcards}
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
