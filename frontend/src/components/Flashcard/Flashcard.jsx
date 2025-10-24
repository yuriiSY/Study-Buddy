import React, { useState } from "react";
import { RiEyeLine, RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import styles from "./Flashcard.module.css";

const Flashcard = ({ cards = [], onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

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
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.tag}>{currentCard.topic}</span>
          <span className={styles.tag}>{currentCard.difficulty}</span>
          <div className={styles.iconBox}>💡</div>
        </div>

        <div className={styles.content}>
          {!showAnswer ? (
            <h2 className={styles.question}>{currentCard.question}</h2>
          ) : (
            <p className={styles.answer}>{currentCard.answer}</p>
          )}

          {!showAnswer && (
            <button
              className={styles.showBtn}
              onClick={() => setShowAnswer(true)}
            >
              <RiEyeLine className={styles.icon} />
              Show Answer
            </button>
          )}
        </div>
      </div>

      <div className={styles.nav}>
        <button
          className={`${styles.navBtn} ${styles.prev}`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <RiArrowLeftLine />
          Previous
        </button>

        <button
          className={`${styles.navBtn} ${styles.next}`}
          onClick={handleNext}
        >
          Next
          <RiArrowRightLine />
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
