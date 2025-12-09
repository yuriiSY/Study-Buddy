import React, { useEffect, useState } from "react";
import styles from "./FlashcardsList.module.css";
import api from "../../api/axios";
import apiPY from "../../api/axiosPython";
import { Lock, Unlock, Check } from "lucide-react";

const FlashcardsList = ({ fileId, onSelectLevel }) => {
  const [levelStatus, setLevelStatus] = useState({
    1: { completed: false, available: true, description: "Easy Level - Foundational concepts and definitions" },
    2: { completed: false, available: false, description: "Intermediate Level - Practical applications and critical thinking" },
    3: { completed: false, available: false, description: "Advanced Level - Complex analysis and synthesis" }
  });
  const [loading, setLoading] = useState(true);
  const [generatingLevel, setGeneratingLevel] = useState(null);

  useEffect(() => {
    if (!fileId) return;

    const loadLevelStatus = async () => {
      try {
        const res = await apiPY.get("/recap-cards-progress", {
          params: { "file_ids[]": fileId }
        });

        if (res.data?.level_status) {
          setLevelStatus(res.data.level_status);
        }
      } catch (err) {
        console.error("Failed to load level status:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLevelStatus();
  }, [fileId]);

  const handleStartLevel = async (level) => {
    if (!levelStatus[level]?.available) return;

    setGeneratingLevel(level);
    try {
      const existingRes = await api.get(`/flashcards/file/${fileId}`);
      const existingSets = Array.isArray(existingRes.data) ? existingRes.data : [];
      const existingSet = existingSets.find(set => set.title === `Recap Cards Level ${level}`);
      
      if (existingSet && Array.isArray(existingSet.cards) && existingSet.cards.length > 0) {
        onSelectLevel(level, existingSet.cards);
        return;
      }

      const res = await apiPY.post("/generate-flashcards", {
        file_ids: [fileId],
        num_flashcards: 5,
        level: level,
      });

      if (res.data?.flashcards) {
        const cards = res.data.flashcards;
        
        try {
          const saveRes = await api.post("/flashcards", {
            file_id: fileId,
            title: `Recap Cards Level ${level}`,
            description: levelStatus[level].description,
            cards: cards,
            level: level,
          });
          
          onSelectLevel(level, cards);
        } catch (saveErr) {
          console.error("Failed to save flashcards:", saveErr);
          onSelectLevel(level, cards);
        }
      }
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      setGeneratingLevel(null);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading flashcard levels...</div>;
  }

  const levels = [1, 2, 3];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recap Cards</h2>
        <p className={styles.subtitle}>Complete levels to unlock advanced content</p>
      </div>

      <div className={styles.levelsList}>
        {levels.map((level) => {
          const status = levelStatus[level];
          const isCompleted = status.completed;
          const isAvailable = status.available;
          const isLocked = !isAvailable;

          return (
            <div key={level} className={`${styles.levelCard} ${isCompleted ? styles.completed : ""} ${isLocked ? styles.locked : ""}`}>
              <div className={styles.levelHeader}>
                <div className={styles.levelInfo}>
                  <div className={styles.levelNumber}>
                    <span className={styles.number}>Level {level}</span>
                    {isCompleted && (
                      <Check size={20} className={styles.checkIcon} />
                    )}
                  </div>
                  <p className={styles.levelDescription}>{status.description}</p>
                </div>
              </div>

              <div className={styles.cardRight}>
                {isLocked ? (
                  <div className={styles.lockBadge}>
                    <Lock size={24} />
                    <span>Locked</span>
                  </div>
                ) : isCompleted ? (
                  <div className={styles.completedBadge}>
                    <Check size={24} />
                    <span>Completed</span>
                  </div>
                ) : (
                  <div className={styles.unlockedBadge}>
                    <Unlock size={24} />
                    <span>Ready</span>
                  </div>
                )}

                <button
                  className={`${styles.startBtn} ${isLocked ? styles.disabledBtn : ""}`}
                  onClick={() => handleStartLevel(level)}
                  disabled={isLocked || generatingLevel === level}
                >
                  {generatingLevel === level ? (
                    <>
                      <span className={styles.spinner}></span>
                      Generating...
                    </>
                  ) : isCompleted ? (
                    "Recap Again"
                  ) : (
                    "Start Level"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.progressSection}>
        <h3 className={styles.progressTitle}>Your Progress</h3>
        <div className={styles.progressBar}>
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`${styles.progressStep} ${levelStatus[level]?.completed ? styles.progressCompleted : levelStatus[level]?.available ? styles.progressActive : styles.progressLocked}`}
              title={`Level ${level}: ${levelStatus[level]?.description}`}
            >
              {level}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FlashcardsList;
