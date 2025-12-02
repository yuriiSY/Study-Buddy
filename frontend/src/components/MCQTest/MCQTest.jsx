import React, { useState } from "react";
import styles from "./MCQTest.module.css";

const MCQTest = ({ questions = [], onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const getScorePerformance = (currentScore) => {
    if (questions.length === 0) return { level: "good", percentage: 0 };
    const percentage = (currentScore / questions.length) * 100;
    if (percentage === 100) return { level: "perfect", percentage };
    if (percentage >= 70) return { level: "good", percentage };
    if (percentage >= 50) return { level: "average", percentage };
    return { level: "poor", percentage };
  };

  const createConfetti = () => {
    if (typeof window === "undefined") return;
    const confettiPieces = 30;
    for (let i = 0; i < confettiPieces; i++) {
      const piece = document.createElement("div");
      piece.className = styles.confettiPiece;
      piece.style.left = Math.random() * 100 + "%";
      piece.style.backgroundColor = [
        "#fbbf24",
        "#34d399",
        "#60a5fa",
        "#f87171",
        "#a78bfa",
      ][Math.floor(Math.random() * 5)];
      piece.style.animation = `confetti ${2 + Math.random() * 1}s ease-in forwards`;
      piece.style.delay = Math.random() * 0.3 + "s";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }
  };

  const getScoreMessage = (level, percentage) => {
    const messages = {
      perfect: {
        emoji: "🎉",
        motivation: "Perfect Score! Outstanding! 🌟",
        encouragement: "You absolutely crushed it! Keep up this amazing performance!",
      },
      good: {
        emoji: "😊",
        motivation: "Great Job! Well Done!",
        encouragement: "You've got a solid grasp of this material. Keep practicing!",
      },
      average: {
        emoji: "💪",
        motivation: "Good Effort! You Can Do Better!",
        encouragement: "You're on the right track. Review and practice more concepts.",
      },
      poor: {
        emoji: "📚",
        motivation: "Keep Learning!",
        encouragement: "This is a learning journey! Review the material and try again.",
      },
    };
    return messages[level] || messages.good;
  };

  const currentQuestion = questions[currentIndex];

  const handleSelect = (questionIndex, option) => {
    const letter = option.trim().charAt(0);
    setAnswers((prev) => ({ ...prev, [questionIndex]: letter }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    let tempScore = 0;

    questions.forEach((q, index) => {
      const userLetter = answers[index] || "";
      const correctLetter = (q.correct_answer || "").trim();
      if (userLetter === correctLetter) {
        tempScore++;
      }
    });

    setScore(tempScore);
    setShowResult(true);
    
    const performance = getScorePerformance(tempScore);
    if (performance.level === "perfect") {
      setTimeout(() => createConfetti(), 300);
    }

    onSubmit?.(answers, tempScore);
  };

  if (showResult) {
    const performance = getScorePerformance(score);
    const message = getScoreMessage(performance.level, performance.percentage);
    const displayPercentage = Math.round(performance.percentage);

    return (
      <div className={`${styles.resultContainer} ${styles.scoreBg} ${styles[performance.level]}`}>
        <div className={styles.scoreEmoji}>{message.emoji}</div>
        <p className={styles.scorePercent}>{displayPercentage}%</p>
        <p className={styles.scoreFraction}>
          {score} out of {questions.length} correct
        </p>
        <p className={styles.motivationText}>{message.motivation}</p>
        <p className={styles.encouragement}>{message.encouragement}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.mode}>🧠 MCQ</span>
        </div>

        <h2 className={styles.question}>{currentQuestion.question}</h2>

        <div className={styles.options}>
          {currentQuestion.options.map((opt, idx) => {
            const letter = opt.trim().charAt(0);

            return (
              <label
                key={idx}
                className={`${styles.option} ${
                  answers[currentIndex] === letter ? styles.selected : ""
                }`}
              >
                <input
                  type="radio"
                  name={`q-${currentIndex}`}
                  value={opt}
                  checked={answers[currentIndex] === letter}
                  onChange={() => handleSelect(currentIndex, opt)}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            onClick={handlePrevious}
            className={`${styles.button} ${styles.prev}`}
            disabled={currentIndex === 0}
          >
            Previous
          </button>

          {currentIndex === questions.length - 1 ? (
            <button className={styles.button} onClick={handleSubmit}>
              Submit
            </button>
          ) : (
            <button className={styles.button} onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQTest;
