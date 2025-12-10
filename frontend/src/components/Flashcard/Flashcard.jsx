import React, { useState, useEffect } from "react";
import { RiEyeLine, RiArrowLeftLine, RiArrowRightLine, RiLightbulbFlashLine } from "react-icons/ri";
import { Zap, Trophy, Star, Sparkles, Clock } from "lucide-react";
import { ClipLoader } from "react-spinners";
import styles from "./Flashcard.module.css";

const Flashcard = ({ cards = [], onFinish, onNextLevel, level = 1, levelDescription = "", loadingNextLevel: isLoadingNextLevel = false, onLevelComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [celebration, setCelebration] = useState(false);
  const [loadingFinish, setLoadingFinish] = useState(false);
  const [loadingNextLevel, setLoadingNextLevel] = useState(false);

  useEffect(() => {
    setCelebration(false);
    setCurrentIndex(0);
    setShowAnswer(false);
    setShowHint(false);
  }, [cards]);

  const currentCard = cards[currentIndex];

  const getLevelColor = () => {
    switch(level) {
      case 1: return "#3B82F6";
      case 2: return "#5BC0DE";
      case 3: return "#06B6D4";
      default: return "#3B82F6";
    }
  };

  const getLevelEmoji = () => {
    switch(level) {
      case 1: return "🎯";
      case 2: return "⚡";
      case 3: return "🔥";
      default: return "🎯";
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
      setShowHint(false);
    } else {
      setCelebration(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  const handleFinishClick = async () => {
    setLoadingFinish(true);
    try {
      await onLevelComplete?.();
      await onFinish?.();
    } finally {
      setLoadingFinish(false);
    }
  };

  const handleNextLevelClick = async () => {
    setLoadingNextLevel(true);
    try {
      await onNextLevel?.();
    } finally {
      setLoadingNextLevel(false);
    }
  };

  if (celebration) {
    const hasNextLevel = level < 3;

    return (
      <div className={styles.container}>
        <div className={styles.celebrationContainer}>
          {isLoadingNextLevel && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}>
                <ClipLoader size={50} color="#3B82F6" />
                <p className={styles.loadingText}>Loading next level...</p>
              </div>
            </div>
          )}
          <div className={styles.confetti}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className={styles.confettiPiece} style={{ "--delay": `${i * 0.05}s` }} />
            ))}
          </div>
          <Trophy size={80} className={styles.trophy} />
          <h1 className={styles.celebrationTitle}>Excellent! 🎉</h1>
          <p className={styles.celebrationText}>You completed all {cards.length} cards at {getLevelEmoji()} Level {level}!</p>
          <p className={styles.celebrationSubtext}>{levelDescription}</p>
          
          <div className={styles.celebrationButtons}>
            {hasNextLevel && (
              <button 
                className={styles.doLaterBtn} 
                onClick={handleFinishClick}
                disabled={loadingFinish || loadingNextLevel}
              >
                {loadingFinish ? (
                  <ClipLoader size={18} color="currentColor" />
                ) : (
                  <>
                    <Clock size={18} /> Do it Later
                  </>
                )}
              </button>
            )}
            {hasNextLevel ? (
              <button 
                className={styles.nextLevelBtn} 
                onClick={handleNextLevelClick}
                disabled={loadingFinish || loadingNextLevel}
              >
                {loadingNextLevel ? (
                  <ClipLoader size={18} color="white" />
                ) : (
                  <>
                    <Zap size={18} /> Next Level
                  </>
                )}
              </button>
            ) : (
              <button 
                className={styles.finishBtn} 
                onClick={handleFinishClick}
                disabled={loadingFinish || loadingNextLevel}
              >
                {loadingFinish ? (
                  <ClipLoader size={18} color="white" />
                ) : (
                  <>Complete</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.levelBadge} style={{ "--level-color": getLevelColor() }}>
        <span className={styles.levelEmoji}>{getLevelEmoji()}</span>
        <span className={styles.levelText}>Level {level}</span>
      </div>

      <div className={styles.levelDescription}>{levelDescription}</div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${((currentIndex + 1) / cards.length) * 100}%`, backgroundColor: getLevelColor() }} />
      </div>

      <div className={styles.flipWrapper}>
        <div className={`${styles.flipCard} ${showAnswer ? styles.flip : ""}`}>
          {/* FRONT (QUESTION) */}
          <div className={styles.front}>
            <div className={styles.card}>
              <div className={styles.header}>
                <span className={styles.tag}>
                  Recap Card {currentIndex + 1} / {cards.length}
                </span>
                <button
                  className={styles.hintBtn}
                  onClick={() => setShowHint(!showHint)}
                  title="Show hint"
                >
                  <RiLightbulbFlashLine className={styles.hintIcon} />
                </button>
              </div>

              <div className={styles.content}>
                <h2 className={styles.question}>{currentCard.question}</h2>
                
                {showHint && (
                  <div className={styles.hint}>
                    <strong>Hint:</strong> {currentCard.answer.substring(0, 100)}...
                  </div>
                )}

                <button
                  className={styles.showBtn}
                  onClick={() => setShowAnswer(true)}
                >
                  <RiEyeLine className={styles.icon} /> Show Answer
                </button>
              </div>
            </div>
          </div>

          <div className={`${styles.back}`}>
            <div className={styles.card}>
              <div className={styles.header}>
                <span className={styles.tag}>Answer</span>
              </div>

              <div className={styles.content}>
                <p className={styles.answer}>{currentCard.answer}</p>

                <button
                  className={styles.showBtn}
                  onClick={() => setShowAnswer(false)}
                >
                  🔄 Show Question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.nav}>
        <button
          className={`${styles.navBtn} ${styles.prev}`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <RiArrowLeftLine /> Previous
        </button>

        <button
          className={`${styles.navBtn} ${styles.next}`}
          onClick={handleNext}
        >
          Next <RiArrowRightLine />
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
