import React, { useState } from "react";
import { RiEyeLine, RiArrowLeftLine, RiArrowRightLine, RiLightbulbFlashLine } from "react-icons/ri";
import styles from "./Flashcard.module.css";

const Flashcard = ({ cards = [], onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowAnswer(false);
    } else {
      onFinish?.();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.flipWrapper}>
        <div className={`${styles.flipCard} ${showAnswer ? styles.flip : ""}`}>
          {/* FRONT (QUESTION) */}
          <div className={styles.front}>
            <div className={styles.card}>
              <div className={styles.header}>
                <span className={styles.tag}>
                  Flashcard {currentIndex + 1} / {cards.length}
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
